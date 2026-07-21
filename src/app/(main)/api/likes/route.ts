import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Like from '@/models/Like'
import { revalidateLikesContent } from '@/lib/revalidate-public-content'

export async function POST() {
    try {
        await connectDB()

        const like = await Like.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true, new: true })

        revalidateLikesContent()

        return NextResponse.json({ count: like.count })
    } catch (error) {
        console.error('Error incrementing like count:', error)
        return NextResponse.json({ error: 'Failed to increment like count' }, { status: 500 })
    }
}
