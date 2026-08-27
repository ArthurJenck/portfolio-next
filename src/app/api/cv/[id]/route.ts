import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import CV from '@/server/models/CV'
import { del } from '@vercel/blob'
import { revalidateCvContent } from '@/server/content/revalidate-public-content'

export const GET = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const cv = await CV.findById(id)

        if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        return NextResponse.json({
            id: cv._id.toString(),
            url: cv.url,
            fileName: cv.fileName,
            customName: cv.customName,
            uploadedAt: cv.uploadedAt,
        })
    },
    { errorMessage: 'Failed to fetch CV' },
)

export const PUT = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
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
        revalidateCvContent()

        return NextResponse.json({
            id: cv._id.toString(),
            url: cv.url,
            fileName: cv.fileName,
            customName: cv.customName,
            uploadedAt: cv.uploadedAt,
        })
    },
    { auth: true, errorMessage: 'Failed to update CV' },
)

export const DELETE = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const cv = await CV.findById(id)

        if (!cv) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        try {
            await del(cv.url)
        } catch (error) {
            console.error('Error deleting CV from Vercel Blob:', error)
        }

        await CV.findByIdAndDelete(id)
        revalidateCvContent()

        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to delete CV' },
)
