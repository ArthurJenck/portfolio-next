import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Skill from '@/models/Skill'
import { revalidateSkillsContent } from '@/lib/revalidate-public-content'

export async function POST(request: Request) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    try {
        await connectDB()
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
    } catch (error) {
        console.error('Error reordering skills:', error)
        return NextResponse.json({ error: 'Failed to reorder skills' }, { status: 500 })
    }
}
