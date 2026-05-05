import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import { generateSlug, normalizeColor } from '@/lib/utils'
import { getPublicProjects } from '@/lib/public-content'
import { revalidateProjectContent } from '@/lib/revalidate-public-content'

export async function GET() {
    try {
        return NextResponse.json(await getPublicProjects())
    } catch (error) {
        console.error('Error fetching projects:', error)
        return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    try {
        await connectDB()
        const body = await request.json()

        // Générer le slug si non fourni
        if (!body.slug && body.name) {
            body.slug = generateSlug(body.name)
        }

        // Normaliser la couleur si fournie
        if (body.color) {
            body.color = normalizeColor(body.color)
        }

        // Si medias n'est pas fourni ou est vide, initialiser avec cover_image
        if ((!body.medias || body.medias.length === 0) && body.cover_image) {
            body.medias = [
                {
                    url: body.cover_image,
                    type: 'image',
                },
            ]
        }

        const project = await Project.create(body)
        revalidateProjectContent({ currentSlug: project.slug })

        return NextResponse.json(project, { status: 201 })
    } catch (error) {
        console.error('Error creating project:', error)
        return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }
}
