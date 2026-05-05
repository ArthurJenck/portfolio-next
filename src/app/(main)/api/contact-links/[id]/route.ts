import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import ContactLink from '@/models/ContactLink'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await connectDB()
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
    } catch (error) {
        console.error('Error fetching contact link:', error)
        return NextResponse.json({ error: 'Failed to fetch contact link' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const { id } = await params
    try {
        await connectDB()
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

        return NextResponse.json(contactLink)
    } catch (error) {
        console.error('Error updating contact link:', error)
        return NextResponse.json({ error: 'Failed to update contact link' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const { id } = await params
    try {
        await connectDB()
        const contactLink = await ContactLink.findById(id)

        if (!contactLink) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        await ContactLink.findByIdAndDelete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting contact link:', error)
        return NextResponse.json({ error: 'Failed to delete contact link' }, { status: 500 })
    }
}
