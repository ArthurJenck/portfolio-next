import { NextResponse } from 'next/server'
import { getPublicProjectBySlug } from '@/lib/public-content'

// Route publique - récupération par slug pour le front
export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params
    try {
        const project = await getPublicProjectBySlug(slug)

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        return NextResponse.json(project)
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
    }
}
