import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import Like from '@/server/models/Like'
import { revalidateLikesContent } from '@/server/content/revalidate-public-content'

export const POST = route(
    async () => {
        const like = await Like.findOneAndUpdate({}, { $inc: { count: 1 } }, { upsert: true, new: true })

        revalidateLikesContent()

        return NextResponse.json({ count: like.count })
    },
    { errorMessage: 'Failed to increment like count' },
)
