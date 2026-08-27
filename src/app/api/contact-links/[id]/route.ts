import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import ContactLink from '@/server/models/ContactLink'
import { revalidateContactLinksContent } from '@/server/content/revalidate-public-content'

export const GET = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const contactLink = await ContactLink.findById(id)

        if (!contactLink) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const response = {
            id: contactLink._id.toString(),
            _id: contactLink._id.toString(),
            href: contactLink.href,
            display_text: contactLink.display_text,
            copy_text: contactLink.copy_text,
            order: contactLink.order,
        }

        return NextResponse.json(response)
    },
    { errorMessage: 'Failed to fetch contact link' },
)

export const PUT = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const body = await request.json()

        const updateData: Record<string, unknown> = {}
        const allowedFields = ['href', 'display_text', 'copy_text', 'order']

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updateData[field] = body[field]
            }
        }

        const contactLink = await ContactLink.findByIdAndUpdate(id, updateData, { new: true })

        if (!contactLink) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        revalidateContactLinksContent()

        return NextResponse.json(contactLink)
    },
    { auth: true, errorMessage: 'Failed to update contact link' },
)

export const DELETE = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const contactLink = await ContactLink.findById(id)

        if (!contactLink) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        await ContactLink.findByIdAndDelete(id)
        revalidateContactLinksContent()

        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to delete contact link' },
)
