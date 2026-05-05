import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Skill from '@/models/Skill'
import { getPublicSkillCategories } from '@/lib/public-content'
import { revalidateSkillsContent } from '@/lib/revalidate-public-content'

export async function GET() {
    try {
        return NextResponse.json(await getPublicSkillCategories())
    } catch (error) {
        console.error('Error fetching skills:', error)
        return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    try {
        await connectDB()
        const body = await request.json()

        // Si order n'est pas fourni, prendre le max + 1
        if (body.order === undefined) {
            const maxSkill = await Skill.findOne().sort({ order: -1 })
            body.order = maxSkill ? maxSkill.order + 1 : 0
        }

        const skill = await Skill.create(body)
        revalidateSkillsContent()

        return NextResponse.json(skill, { status: 201 })
    } catch (error) {
        console.error('Error creating skill:', error)
        return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
    }
}
