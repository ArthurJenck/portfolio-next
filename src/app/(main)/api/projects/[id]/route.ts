import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import { Types } from 'mongoose'
import { generateSlug } from '@/lib/utils'
import { del } from '@vercel/blob'

interface PopulatedSkill {
    _id: Types.ObjectId
    name: string
    icon?: string
    description?: string
}

// Route pour l'admin - récupération par ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await connectDB()
        const project = await Project.findById(id).populate('stack')

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

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    try {
        await connectDB()
        const body = await request.json()

        // Récupérer le projet actuel
        const currentProject = await Project.findById(id)
        if (!currentProject) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Si le nom change, regénérer le slug
        if (body.name && body.name !== currentProject.name) {
            body.slug = generateSlug(body.name)
        }

        // Si l'image change, supprimer l'ancienne de Vercel Blob
        if (body.image && body.image !== currentProject.image) {
            try {
                await del(currentProject.image)
            } catch (error) {
                console.error('Error deleting old project image from Vercel Blob:', error)
                // Continue même si la suppression échoue
            }
        }

        const project = await Project.findByIdAndUpdate(id, body, { new: true })

        return NextResponse.json(project)
    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    try {
        await connectDB()
        const project = await Project.findById(id)

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Supprimer l'image de Vercel Blob
        if (project.image) {
            try {
                await del(project.image)
            } catch (error) {
                console.error('Error deleting project image from Vercel Blob:', error)
                // Continue même si la suppression échoue
            }
        }

        // Supprimer le projet de MongoDB
        await Project.findByIdAndDelete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }
}
