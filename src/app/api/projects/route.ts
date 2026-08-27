import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import Project from '@/server/models/Project'
import { generateSlug, normalizeColor } from '@/lib/utils'
import { getPublicProjects } from '@/server/content/public-content'
import { revalidateProjectContent } from '@/server/content/revalidate-public-content'

export const GET = route(
    async () => {
        return NextResponse.json(await getPublicProjects())
    },
    { errorMessage: 'Failed to fetch projects' },
)

export const POST = route(
    async (request) => {
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
    },
    { auth: true, errorMessage: 'Failed to create project' },
)
