import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Skill from '@/models/Skill'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await connectDB()
        const skill = await Skill.findById(id)

        if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(skill)
    } catch (error) {
        console.error('Error fetching skill:', error)
        return NextResponse.json({ error: 'Failed to fetch skill' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    try {
        await connectDB()
        const body = await request.json()
        const skill = await Skill.findByIdAndUpdate(id, body, { new: true })

        if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(skill)
    } catch (error) {
        console.error('Error updating skill:', error)
        return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    try {
        await connectDB()
        const skill = await Skill.findByIdAndDelete(id)

        if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting skill:', error)
        return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 })
    }
}
