import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import SkillCategory from '@/models/SkillCategory'
import { revalidateSkillsContent } from '@/lib/revalidate-public-content'

export async function GET() {
    try {
        await connectDB()
        const categories = await SkillCategory.find().sort({ order: 1 })

        return NextResponse.json(categories)
    } catch (error) {
        console.error('Error fetching skill categories:', error)
        return NextResponse.json({ error: 'Failed to fetch skill categories' }, { status: 500 })
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
            const maxCategory = await SkillCategory.findOne().sort({ order: -1 })
            body.order = maxCategory ? maxCategory.order + 1 : 0
        }

        const category = await SkillCategory.create(body)
        revalidateSkillsContent()

        return NextResponse.json(category, { status: 201 })
    } catch (error) {
        console.error('Error creating skill category:', error)
        return NextResponse.json({ error: 'Failed to create skill category' }, { status: 500 })
    }
}
