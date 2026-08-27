import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import SkillCategory from '@/server/models/SkillCategory'
import { revalidateSkillsContent } from '@/server/content/revalidate-public-content'

export const POST = route(
    async (request) => {
        const { categoryId, direction } = await request.json()

        const currentCategory = await SkillCategory.findById(categoryId)
        if (!currentCategory) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 })
        }

        // Trouver la catégorie à échanger
        const swapCategory =
            direction === 'up'
                ? await SkillCategory.findOne({ order: { $lt: currentCategory.order } }).sort({ order: -1 })
                : await SkillCategory.findOne({ order: { $gt: currentCategory.order } }).sort({ order: 1 })

        if (!swapCategory) {
            return NextResponse.json({ error: 'Cannot move in that direction' }, { status: 400 })
        }

        // Échanger les ordres
        const tempOrder = currentCategory.order
        currentCategory.order = swapCategory.order
        swapCategory.order = tempOrder

        await currentCategory.save()
        await swapCategory.save()
        revalidateSkillsContent()

        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to reorder skill categories' },
)
