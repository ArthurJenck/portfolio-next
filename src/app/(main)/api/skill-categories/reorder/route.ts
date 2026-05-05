import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import SkillCategory from '@/models/SkillCategory'
import { revalidateSkillsContent } from '@/lib/revalidate-public-content'

export async function POST(request: Request) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    try {
        await connectDB()
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
    } catch (error) {
        console.error('Error reordering skill categories:', error)
        return NextResponse.json({ error: 'Failed to reorder skill categories' }, { status: 500 })
    }
}
