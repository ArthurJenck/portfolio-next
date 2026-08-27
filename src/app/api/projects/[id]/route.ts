import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import Project from '@/server/models/Project'
import Skill from '@/server/models/Skill'
import { Types } from 'mongoose'
import { generateSlug, normalizeColor } from '@/lib/utils'
import { del } from '@vercel/blob'
import { revalidateProjectContent } from '@/server/content/revalidate-public-content'

interface PopulatedSkill {
    _id: Types.ObjectId
    name: string
    icon?: string
    description?: string
}

// Route pour l'admin - récupération par ID
export const GET = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
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
            mobile_cover_image: project.mobile_cover_image,
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
            music: project.music,
        }

        return NextResponse.json(response)
    },
    { errorMessage: 'Failed to fetch project' },
)

export const PUT = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
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
            'mobile_cover_image',
            'medias',
            'order',
            'color',
            'music',
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
            }
        }

        // Si mobile_cover_image change, supprimer l'ancienne de Vercel Blob
        if (
            updateData.mobile_cover_image !== undefined &&
            currentProject.mobile_cover_image &&
            updateData.mobile_cover_image !== currentProject.mobile_cover_image
        ) {
            try {
                await del(currentProject.mobile_cover_image)
            } catch (error) {
                console.error('Error deleting old project mobile_cover_image from Vercel Blob:', error)
            }
        }

        // Si les medias changent, supprimer les anciens medias de Vercel Blob
        if (updateData.medias && Array.isArray(updateData.medias)) {
            const newUrls = new Set([
                ...updateData.medias.map((m: { url: string }) => m.url),
                ...updateData.medias.filter((m: { mobileUrl?: string }) => m.mobileUrl).map((m: { mobileUrl?: string }) => m.mobileUrl as string),
            ])
            const oldMedias = currentProject.medias || []

            for (const oldMedia of oldMedias) {
                if (!newUrls.has(oldMedia.url)) {
                    try {
                        await del(oldMedia.url)
                    } catch (error) {
                        console.error('Error deleting old media from Vercel Blob:', error)
                    }
                }
                if (oldMedia.mobileUrl && !newUrls.has(oldMedia.mobileUrl)) {
                    try {
                        await del(oldMedia.mobileUrl)
                    } catch (error) {
                        console.error('Error deleting old media mobileUrl from Vercel Blob:', error)
                    }
                }
            }
        }

        // Si la musique change ou est retirée, supprimer l'ancien mp3 de Vercel Blob
        if ('music' in updateData) {
            const oldMusicUrl = currentProject.music?.url
            const newMusicUrl = (updateData.music as { url?: string } | null)?.url
            if (oldMusicUrl && oldMusicUrl !== newMusicUrl) {
                try {
                    await del(oldMusicUrl)
                } catch (error) {
                    console.error('Error deleting old project music from Vercel Blob:', error)
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
    },
    { auth: true, errorMessage: 'Failed to update project' },
)

export const DELETE = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const project = await Project.findById(id)

        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        // Supprimer la cover_image et mobile_cover_image de Vercel Blob
        for (const url of [project.cover_image, project.mobile_cover_image].filter(Boolean)) {
            try {
                await del(url as string)
            } catch (error) {
                console.error('Error deleting project cover from Vercel Blob:', error)
            }
        }

        // Supprimer le mp3 de la musique du projet, s'il y en a une
        if (project.music?.url) {
            try {
                await del(project.music.url)
            } catch (error) {
                console.error('Error deleting project music from Vercel Blob:', error)
            }
        }

        // Supprimer tous les medias de Vercel Blob (url + mobileUrl)
        if (project.medias && project.medias.length > 0) {
            for (const media of project.medias) {
                for (const url of [media.url, media.mobileUrl].filter(Boolean)) {
                    try {
                        await del(url as string)
                    } catch (error) {
                        console.error('Error deleting media from Vercel Blob:', error)
                    }
                }
            }
        }

        // Supprimer le projet de MongoDB
        await Project.findByIdAndDelete(id)
        revalidateProjectContent({ previousSlug: project.slug })

        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to delete project' },
)
