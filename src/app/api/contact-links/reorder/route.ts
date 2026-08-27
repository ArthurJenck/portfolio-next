import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import ContactLink from '@/server/models/ContactLink'
import { revalidateContactLinksContent } from '@/server/content/revalidate-public-content'

export const POST = route(
    async (request) => {
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

        revalidateContactLinksContent()

        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to reorder contact link' },
)
