import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import { Types } from 'mongoose'

interface PopulatedSkill {
    _id: Types.ObjectId
    name: string
    icon?: string
    description?: string
}

// Route publique - récupération par slug pour le front
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    try {
        await connectDB()
        const project = await Project.findOne({ slug }).populate('stack')

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Renvoyer DetailedProjectType
        const response = {
            id: project._id.toString(),
            name: project.name,
            slug: project.slug,
            image: project.image,
            description: project.description,
            stack: (project.stack as unknown as PopulatedSkill[]).map((skill) => ({
                id: skill._id.toString(),
                name: skill.name,
                icon: skill.icon || '',
                description: skill.description || '',
            })),
            github_url: project.githubLink,
            project_url: project.webLink,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
    }
}
