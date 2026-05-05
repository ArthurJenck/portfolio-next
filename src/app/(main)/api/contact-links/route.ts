import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ContactLink from '@/models/ContactLink'
import { getPublicContactLinks } from '@/lib/public-content'
import { revalidateContactLinksContent } from '@/lib/revalidate-public-content'

export async function GET() {
    try {
        return NextResponse.json(await getPublicContactLinks())
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
        revalidateContactLinksContent()

        return NextResponse.json(contactLink, { status: 201 })
    } catch (error) {
        console.error('Error creating contact link:', error)
        return NextResponse.json({ error: 'Failed to create contact link' }, { status: 500 })
    }
}
