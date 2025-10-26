import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'

export async function POST(request: Request) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
