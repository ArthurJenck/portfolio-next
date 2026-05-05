import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    try {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const customName = formData.get('customName') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const fileName = customName || file.name

        // Upload vers Vercel Blob
        const blob = await put(fileName, file, {
            access: 'public',
            addRandomSuffix: customName ? false : true,
        })

        return NextResponse.json({ url: blob.url, fileName: file.name })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
    }
}
