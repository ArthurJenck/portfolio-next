import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import { Types } from 'mongoose'

interface PopulatedSkill {
    _id: Types.ObjectId
    name: string
    icon?: string
    description?: string
}

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
        const project = await Project.findByIdAndUpdate(id, body, { new: true })

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
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
        const project = await Project.findByIdAndDelete(id)

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }
}
