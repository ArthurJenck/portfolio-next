import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import { Types } from 'mongoose'
import { generateSlug } from '@/lib/utils'

interface PopulatedSkill {
    _id: Types.ObjectId
    name: string
    icon?: string
    description?: string
}

export async function GET() {
    try {
        await connectDB()
        const projects = await Project.find().populate('stack').sort({ order: 1 })

        // Renvoyer MinimalProjectType
        const response = projects.map((project) => ({
            id: project._id.toString(),
            name: project.name,
            slug: project.slug,
            image: project.image,
            summary: project.summary,
            stack: (project.stack as unknown as PopulatedSkill[]).map((skill) => ({
                id: skill._id.toString(),
                name: skill.name,
                icon: skill.icon || '',
                description: skill.description || '',
            })),
        }))

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        await connectDB()
        const body = await request.json()

        // Générer le slug si non fourni
        if (!body.slug && body.name) {
            body.slug = generateSlug(body.name)
        }

        // Si order n'est pas fourni, prendre le max + 1
        if (body.order === undefined) {
            const maxProject = await Project.findOne().sort({ order: -1 })
            body.order = maxProject ? maxProject.order + 1 : 0
        }

        const project = await Project.create(body)

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
}
