import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Skill from '@/models/Skill'
import { del } from '@vercel/blob'

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
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const { id } = await params
    try {
        await connectDB()
        const body = await request.json()

        // Récupérer le skill actuel
        const currentSkill = await Skill.findById(id)
        if (!currentSkill) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Si l'icône change, supprimer l'ancienne de Vercel Blob
        if (body.icon && body.icon !== currentSkill.icon && currentSkill.icon) {
            try {
                await del(currentSkill.icon)
            } catch (error) {
                console.error('Error deleting old skill icon from Vercel Blob:', error)
                // Continue même si la suppression échoue
            }
        }

        const skill = await Skill.findByIdAndUpdate(id, body, { new: true })

        return NextResponse.json(skill)
    } catch (error) {
        console.error('Error updating skill:', error)
        return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const { id } = await params
    try {
        await connectDB()
        const skill = await Skill.findById(id)

        if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Supprimer l'icône de Vercel Blob si elle existe
        if (skill.icon) {
            try {
                await del(skill.icon)
            } catch (error) {
                console.error('Error deleting skill icon from Vercel Blob:', error)
                // Continue même si la suppression échoue
            }
        }

        // Supprimer le skill de MongoDB
        await Skill.findByIdAndDelete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting skill:', error)
        return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 })
    }
}
