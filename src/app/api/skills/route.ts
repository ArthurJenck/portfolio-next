import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import Skill from '@/server/models/Skill'
import { getPublicSkillCategories } from '@/server/content/public-content'
import { revalidateSkillsContent } from '@/server/content/revalidate-public-content'

export const GET = route(
    async () => {
        return NextResponse.json(await getPublicSkillCategories())
    },
    { errorMessage: 'Failed to fetch skills' },
)

export const POST = route(
    async (request) => {
        const body = await request.json()

        // Si order n'est pas fourni, prendre le max + 1
        if (body.order === undefined) {
            const maxSkill = await Skill.findOne().sort({ order: -1 })
            body.order = maxSkill ? maxSkill.order + 1 : 0
        }

        const skill = await Skill.create(body)
        revalidateSkillsContent()

        return NextResponse.json(skill, { status: 201 })
    },
    { auth: true, errorMessage: 'Failed to create skill' },
)
