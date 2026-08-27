import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import { put } from '@vercel/blob'

export const POST = route(
    async (request) => {
        const formData = await request.formData()
        const file = formData.get('file') as File
        const customName = formData.get('customName') as string | null

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 })
        }

        const extensionMatch = file.name.match(/\.[^./\\]+$/)
        const extension = extensionMatch ? extensionMatch[0] : ''

        let fileName = customName || file.name
        if (extension && !fileName.toLowerCase().endsWith(extension.toLowerCase())) {
            fileName += extension
        }

        // Upload vers Vercel Blob
        const blob = await put(fileName, file, {
            access: 'public',
            addRandomSuffix: customName ? false : true,
        })

        return NextResponse.json({ url: blob.url, fileName: file.name })
    },
    { auth: true, db: false, errorMessage: 'Upload failed' },
)
