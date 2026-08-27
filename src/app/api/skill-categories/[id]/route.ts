import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import SkillCategory from '@/server/models/SkillCategory'
import { revalidateSkillsContent } from '@/server/content/revalidate-public-content'

export const GET = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const category = await SkillCategory.findById(id)

        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(category)
    },
    { errorMessage: 'Failed to fetch skill category' },
)

export const PUT = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const body = await request.json()
        const category = await SkillCategory.findByIdAndUpdate(id, body, { new: true })

        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        revalidateSkillsContent()
        return NextResponse.json(category)
    },
    { auth: true, errorMessage: 'Failed to update skill category' },
)

export const DELETE = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const category = await SkillCategory.findByIdAndDelete(id)

        if (!category) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        revalidateSkillsContent()
        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to delete skill category' },
)
