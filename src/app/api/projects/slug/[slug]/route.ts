import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import { getPublicProjectBySlug } from '@/server/content/public-content'

// Route publique - récupération par slug pour le front
export const GET = route<{ slug: string }>(
    async (request, { params }) => {
        const { slug } = await params
        const project = await getPublicProjectBySlug(slug)

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        return NextResponse.json(project)
    },
    { errorMessage: 'Failed to fetch project' },
)
