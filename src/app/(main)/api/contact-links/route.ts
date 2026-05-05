import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ContactLink from '@/models/ContactLink'

export async function GET() {
    try {
        await connectDB()
        const contactLinks = await ContactLink.find().sort({ order: 1 })

        const response = contactLinks.map((link) => ({
            id: link._id.toString(),
            _id: link._id.toString(),
            href: link.href,
            display_text: link.display_text,
            copy_text: link.copy_text,
            order: link.order,
        }))

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching contact links:', error)
        return NextResponse.json({ error: 'Failed to fetch contact links' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    try {
        await connectDB()
        const body = await request.json()

        // Si order n'est pas fourni, prendre le max + 1
        if (body.order === undefined) {
            const maxContactLink = await ContactLink.findOne().sort({ order: -1 })
            body.order = maxContactLink ? maxContactLink.order + 1 : 0
        }

        const contactLink = await ContactLink.create(body)

        return NextResponse.json(contactLink, { status: 201 })
    } catch (error) {
        console.error('Error creating contact link:', error)
        return NextResponse.json({ error: 'Failed to create contact link' }, { status: 500 })
    }
}
