import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Skill from '@/models/Skill'
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
        // Force Skill model registration
        Skill.modelName
        const projects = await Project.find().populate('stack').sort({ order: 1 })

        // Renvoyer MinimalProjectType
        const response = projects.map((project) => ({
            id: project._id.toString(),
            name: project.name,
            subtitle: project.subtitle,
            date: project.date.toISOString(),
            slug: project.slug,
            cover_image: project.cover_image,
            summary: project.summary,
            stack: project.stack
                ? (project.stack as unknown as PopulatedSkill[]).map((skill) => ({
                      id: skill._id.toString(),
                      name: skill.name,
                      icon: skill.icon || '',
                      description: skill.description || '',
                  }))
                : [],
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

        // Si medias n'est pas fourni ou est vide, initialiser avec cover_image
        if ((!body.medias || body.medias.length === 0) && body.cover_image) {
            body.medias = [
                {
                    url: body.cover_image,
                    type: 'image',
                },
            ]
        }

        const project = await Project.create(body)

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
}
