import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import ContactLink from '@/server/models/ContactLink'
import { getPublicContactLinks } from '@/server/content/public-content'
import { revalidateContactLinksContent } from '@/server/content/revalidate-public-content'

export const GET = route(
    async () => {
        return NextResponse.json(await getPublicContactLinks())
    },
    { errorMessage: 'Failed to fetch contact links' },
)

export const POST = route(
    async (request) => {
        const body = await request.json()

        // Si order n'est pas fourni, prendre le max + 1
        if (body.order === undefined) {
            const maxContactLink = await ContactLink.findOne().sort({ order: -1 })
            body.order = maxContactLink ? maxContactLink.order + 1 : 0
        }

        const contactLink = await ContactLink.create(body)
        revalidateContactLinksContent()

        return NextResponse.json(contactLink, { status: 201 })
    },
    { auth: true, errorMessage: 'Failed to create contact link' },
)
