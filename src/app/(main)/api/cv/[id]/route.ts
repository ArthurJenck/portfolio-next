import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import CV from '@/models/CV'
import { del } from '@vercel/blob'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await connectDB()
        const cv = await CV.findById(id)

        if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        return NextResponse.json({
            id: cv._id.toString(),
            url: cv.url,
            fileName: cv.fileName,
            customName: cv.customName,
            uploadedAt: cv.uploadedAt,
        })
    } catch (error) {
        console.error('Error fetching CV:', error)
        return NextResponse.json({ error: 'Failed to fetch CV' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const { id } = await params
    try {
        await connectDB()
        const body = await request.json()

        const currentCV = await CV.findById(id)
        if (!currentCV) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        if (body.url && body.url !== currentCV.url) {
            try {
                await del(currentCV.url)
            } catch (error) {
                console.error('Error deleting old CV from Vercel Blob:', error)
            }
        }

        const cv = await CV.findByIdAndUpdate(id, body, { new: true })

        return NextResponse.json({
            id: cv._id.toString(),
            url: cv.url,
            fileName: cv.fileName,
            customName: cv.customName,
            uploadedAt: cv.uploadedAt,
        })
    } catch (error) {
        console.error('Error updating CV:', error)
        return NextResponse.json({ error: 'Failed to update CV' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const { id } = await params
    try {
        await connectDB()
        const cv = await CV.findById(id)

        if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        try {
            await del(cv.url)
        } catch (error) {
            console.error('Error deleting CV from Vercel Blob:', error)
        }

        await CV.findByIdAndDelete(id)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting CV:', error)
        return NextResponse.json({ error: 'Failed to delete CV' }, { status: 500 })
    }
}
