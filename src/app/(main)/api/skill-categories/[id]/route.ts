import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import SkillCategory from '@/models/SkillCategory'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await connectDB()
        const category = await SkillCategory.findById(id)

        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Error fetching skill category:', error)
        return NextResponse.json({ error: 'Failed to fetch skill category' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    try {
        await connectDB()
        const body = await request.json()
        const category = await SkillCategory.findByIdAndUpdate(id, body, { new: true })

        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(category)
    } catch (error) {
        console.error('Error updating skill category:', error)
        return NextResponse.json({ error: 'Failed to update skill category' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    try {
        await connectDB()
        const category = await SkillCategory.findByIdAndDelete(id)

        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting skill category:', error)
        return NextResponse.json({ error: 'Failed to delete skill category' }, { status: 500 })
    }
}
