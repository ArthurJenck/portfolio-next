import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { put } from '@vercel/blob'
import connectDB from '@/lib/mongodb'
import Media from '@/models/Media'

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Upload vers Vercel Blob
    const blob = await put(file.name, file, {
      access: 'public',
    })

    // Sauvegarder metadata dans MongoDB
    await connectDB()
    const media = await Media.create({
      url: blob.url,
      filename: file.name,
      mimeType: file.type,
      filesize: file.size,
      alt: formData.get('alt') || '',
    })

    return NextResponse.json(media)
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

