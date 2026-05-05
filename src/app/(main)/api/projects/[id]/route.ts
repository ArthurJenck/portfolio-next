import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Skill from '@/models/Skill'
import { Types } from 'mongoose'
import { generateSlug, normalizeColor } from '@/lib/utils'
import { del } from '@vercel/blob'
import { revalidateProjectContent } from '@/lib/revalidate-public-content'

interface PopulatedSkill {
    _id: Types.ObjectId
    name: string
    icon?: string
    description?: string
}

// Route pour l'admin - récupération par ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        await connectDB()
        // Force Skill model registration
        Skill.modelName
        const project = await Project.findById(id).populate('stack')

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Renvoyer les données complètes pour l'admin
        const response = {
            id: project._id.toString(),
            _id: project._id.toString(),
            name: project.name,
            subtitle: project.subtitle,
            date: project.date.toISOString(),
            slug: project.slug,
            cover_image: project.cover_image,
            medias: project.medias || [],
            summary: project.summary,
            description: project.description,
            color: project.color || '#f0f0f0',
            stack: project.stack
                ? (project.stack as unknown as PopulatedSkill[]).map((skill) => skill._id.toString())
                : [],
            githubLink: project.githubLink,
            webLink: project.webLink,
            order: project.order,
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching project:', error)
        return NextResponse.json({ error: 'Failed to fetch project' }, { status: 500 })
    }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const { id } = await params
    try {
        await connectDB()
        const body = await request.json()

        // Récupérer le projet actuel
        const currentProject = await Project.findById(id)
        if (!currentProject) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Nettoyer les données : ne garder que les champs MongoDB valides
        const updateData: Record<string, unknown> = {}
        const allowedFields = [
            'name',
            'subtitle',
            'date',
            'summary',
            'description',
            'stack',
            'githubLink',
            'webLink',
            'cover_image',
            'medias',
            'order',
            'color',
        ]

        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                // Traitement spécial pour stack : filtrer pour garder des strings valides
                if (field === 'stack' && Array.isArray(body[field])) {
                    updateData[field] = body[field].filter(
                        (item: unknown) => typeof item === 'string' && item.length > 0,
                    )
                } else if (field === 'color' && typeof body[field] === 'string') {
                    // Normaliser la couleur
                    updateData[field] = normalizeColor(body[field])
                } else {
                    updateData[field] = body[field]
                }
            }
        }

        // Si le nom change, regénérer le slug
        if (updateData.name && updateData.name !== currentProject.name) {
            updateData.slug = generateSlug(updateData.name as string)
        }

        // Si medias est vide lors de la sauvegarde, copier cover_image dedans
        if (updateData.medias && Array.isArray(updateData.medias) && updateData.medias.length === 0) {
            const coverImage = (updateData.cover_image as string) || currentProject.cover_image
            if (coverImage) {
                updateData.medias = [
                    {
                        url: coverImage,
                        type: 'image',
                    },
                ]
            }
        }

        // Si la cover_image change, supprimer l'ancienne de Vercel Blob
        if (updateData.cover_image && updateData.cover_image !== currentProject.cover_image) {
            try {
                await del(currentProject.cover_image)
            } catch (error) {
                console.error('Error deleting old project cover_image from Vercel Blob:', error)
                // Continue même si la suppression échoue
            }
        }

        // Si les medias changent, supprimer les anciens medias de Vercel Blob
        if (updateData.medias && Array.isArray(updateData.medias)) {
            const newMediaUrls = updateData.medias.map((m: { url: string }) => m.url)
            const oldMedias = currentProject.medias || []

            for (const oldMedia of oldMedias) {
                if (!newMediaUrls.includes(oldMedia.url)) {
                    try {
                        await del(oldMedia.url)
                    } catch (error) {
                        console.error('Error deleting old media from Vercel Blob:', error)
                        // Continue même si la suppression échoue
                    }
                }
            }
        }

        const project = await Project.findByIdAndUpdate(id, updateData, { new: true })

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        revalidateProjectContent({
            currentSlug: project.slug,
            previousSlug: currentProject.slug,
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error('Error updating project:', error)
        return NextResponse.json({ error: 'Failed to update project' }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    const { id } = await params
    try {
        await connectDB()
        const project = await Project.findById(id)

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Supprimer la cover_image de Vercel Blob
        if (project.cover_image) {
            try {
                await del(project.cover_image)
            } catch (error) {
                console.error('Error deleting project cover_image from Vercel Blob:', error)
                // Continue même si la suppression échoue
            }
        }

        // Supprimer tous les medias de Vercel Blob
        if (project.medias && project.medias.length > 0) {
            for (const media of project.medias) {
                try {
                    await del(media.url)
                } catch (error) {
                    console.error('Error deleting media from Vercel Blob:', error)
                    // Continue même si la suppression échoue
                }
            }
        }

        // Supprimer le projet de MongoDB
        await Project.findByIdAndDelete(id)
        revalidateProjectContent({ previousSlug: project.slug })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error deleting project:', error)
        return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 })
    }
}
