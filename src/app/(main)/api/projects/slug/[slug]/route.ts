import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Skill from '@/models/Skill'
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
        // Force Skill model registration
        Skill.modelName
        const project = await Project.findOne({ slug }).populate('stack')

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Renvoyer DetailedProjectType
        const response = {
            id: project._id.toString(),
            name: project.name,
            subtitle: project.subtitle,
            date: project.date.toISOString(),
            slug: project.slug,
            cover_image: project.cover_image,
            medias:
                project.medias && project.medias.length > 0
                    ? project.medias
                    : [{ url: project.cover_image, type: 'image' as const }],
            summary: project.summary,
            description: project.description,
            stack: project.stack
                ? (project.stack as unknown as PopulatedSkill[]).map((skill) => ({
                      id: skill._id.toString(),
                      name: skill.name,
                      icon: skill.icon || '',
                      description: skill.description || '',
                  }))
                : [],
            githubLink: project.githubLink,
            webLink: project.webLink,
            order: project.order,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
    }
}
