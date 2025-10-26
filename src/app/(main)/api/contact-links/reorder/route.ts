import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ContactLink from '@/models/ContactLink'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        await connectDB()
        const { contactLinkId, direction } = await request.json()

        const currentLink = await ContactLink.findById(contactLinkId)
        if (!currentLink) {
            return NextResponse.json({ error: 'Contact link not found' }, { status: 404 })
        }

        const currentOrder = currentLink.order

        if (direction === 'up') {
            // Trouver l'élément précédent
            const previousLink = await ContactLink.findOne({
                order: { $lt: currentOrder },
            }).sort({ order: -1 })

            if (previousLink) {
                // Échanger les order
                await ContactLink.findByIdAndUpdate(currentLink._id, { order: previousLink.order })
                await ContactLink.findByIdAndUpdate(previousLink._id, { order: currentOrder })
            }
        } else if (direction === 'down') {
            // Trouver l'élément suivant
            const nextLink = await ContactLink.findOne({
                order: { $gt: currentOrder },
            }).sort({ order: 1 })

            if (nextLink) {
                // Échanger les order
                await ContactLink.findByIdAndUpdate(currentLink._id, { order: nextLink.order })
                await ContactLink.findByIdAndUpdate(nextLink._id, { order: currentOrder })
            }
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error reordering contact link:', error)
        return NextResponse.json({ error: 'Failed to reorder contact link' }, { status: 500 })
    }
}
