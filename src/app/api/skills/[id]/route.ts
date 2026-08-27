import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import Skill from '@/server/models/Skill'
import { del } from '@vercel/blob'
import { revalidateSkillsContent } from '@/server/content/revalidate-public-content'

export const GET = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const skill = await Skill.findById(id)

        if (!skill) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(skill)
    },
    { errorMessage: 'Failed to fetch skill' },
)

export const PUT = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
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
        revalidateSkillsContent()

        return NextResponse.json(skill)
    },
    { auth: true, errorMessage: 'Failed to update skill' },
)

export const DELETE = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
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
        revalidateSkillsContent()

        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to delete skill' },
)
