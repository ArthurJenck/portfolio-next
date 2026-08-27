import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import CV from '@/server/models/CV'
import { del } from '@vercel/blob'
import { getPublicCv } from '@/server/content/public-content'
import { revalidateCvContent } from '@/server/content/revalidate-public-content'

export const GET = route(
    async () => {
        const cv = await getPublicCv()

        if (!cv) {
            return NextResponse.json({ error: 'CV not found' }, { status: 404 })
        }

        return NextResponse.json(cv)
    },
    { errorMessage: 'Failed to fetch CV' },
)

export const POST = route(
    async (request) => {
        const body = await request.json()

        // Vérifier si un CV existe déjà
        const existingCV = await CV.findOne()

        // Si un CV existe, supprimer l'ancien fichier de Vercel Blob
        if (existingCV && existingCV.url) {
            try {
                await del(existingCV.url)
            } catch (error) {
                console.error('Error deleting old CV from Vercel Blob:', error)
                // Continue même si la suppression échoue
            }
        }

        // Créer ou mettre à jour le document CV
        const cvData = {
            url: body.url,
            fileName: body.fileName,
            customName: body.customName,
            uploadedAt: new Date(),
        }

        let cv
        if (existingCV) {
            cv = await CV.findByIdAndUpdate(existingCV._id, cvData, { new: true })
        } else {
            cv = await CV.create(cvData)
        }

        revalidateCvContent()

        return NextResponse.json({
            id: cv._id.toString(),
            url: cv.url,
            fileName: cv.fileName,
            customName: cv.customName,
            uploadedAt: cv.uploadedAt,
        })
    },
    { auth: true, errorMessage: 'Failed to save CV' },
)
