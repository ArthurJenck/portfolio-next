import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        await connectDB()
        const { projectId, direction } = await request.json()

        const currentProject = await Project.findById(projectId)
        if (!currentProject) {
            return NextResponse.json({ error: 'Project not found' }, { status: 404 })
        }

        // Trouver le projet à échanger
        const swapProject =
            direction === 'up'
                ? await Project.findOne({ order: { $lt: currentProject.order } }).sort({ order: -1 })
                : await Project.findOne({ order: { $gt: currentProject.order } }).sort({ order: 1 })

        if (!swapProject) {
            return NextResponse.json({ error: 'Cannot move in that direction' }, { status: 400 })
        }

        // Échanger les ordres
        const tempOrder = currentProject.order
        currentProject.order = swapProject.order
        swapProject.order = tempOrder

        await currentProject.save()
        await swapProject.save()

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering projects:', error)
        return NextResponse.json({ error: 'Failed to reorder projects' }, { status: 500 })
    }
}
