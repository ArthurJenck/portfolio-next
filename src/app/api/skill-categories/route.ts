import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import SkillCategory from '@/server/models/SkillCategory'
import { revalidateSkillsContent } from '@/server/content/revalidate-public-content'

export const GET = route(
    async () => {
        const categories = await SkillCategory.find().sort({ order: 1 })

        return NextResponse.json(categories)
    },
    { errorMessage: 'Failed to fetch skill categories' },
)

export const POST = route(
    async (request) => {
        const body = await request.json()

        // Si order n'est pas fourni, prendre le max + 1
        if (body.order === undefined) {
            const maxCategory = await SkillCategory.findOne().sort({ order: -1 })
            body.order = maxCategory ? maxCategory.order + 1 : 0
        }

        const category = await SkillCategory.create(body)
        revalidateSkillsContent()

        return NextResponse.json(category, { status: 201 })
    },
    { auth: true, errorMessage: 'Failed to create skill category' },
)
