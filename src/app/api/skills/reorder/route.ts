import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import Skill from '@/server/models/Skill'
import { revalidateSkillsContent } from '@/server/content/revalidate-public-content'

export const POST = route(
    async (request) => {
        const { skillId, direction } = await request.json()

        const currentSkill = await Skill.findById(skillId)
        if (!currentSkill) {
            return NextResponse.json({ error: 'Skill not found' }, { status: 404 })
        }

        // Trouver le skill à échanger dans la même catégorie
        const query = currentSkill.categoryId ? { categoryId: currentSkill.categoryId } : { categoryId: null }

        const swapSkill =
            direction === 'up'
                ? await Skill.findOne({ ...query, order: { $lt: currentSkill.order } }).sort({ order: -1 })
                : await Skill.findOne({ ...query, order: { $gt: currentSkill.order } }).sort({ order: 1 })

        if (!swapSkill) {
            return NextResponse.json({ error: 'Cannot move in that direction' }, { status: 400 })
        }

        // Échanger les ordres
        const tempOrder = currentSkill.order
        currentSkill.order = swapSkill.order
        swapSkill.order = tempOrder

        await currentSkill.save()
        await swapSkill.save()
        revalidateSkillsContent()

        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to reorder skills' },
)
