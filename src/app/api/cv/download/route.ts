import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import { getPublicCv } from '@/server/content/public-content'

export const GET = route(
    async () => {
        const cv = await getPublicCv()

        if (!cv) {
            return NextResponse.json({ error: 'CV not found' }, { status: 404 })
        }

        // Récupérer le fichier depuis Vercel Blob
        const response = await fetch(cv.url)

        if (!response.ok) {
            throw new Error('Failed to fetch CV file')
        }

        // Obtenir le blob du fichier
        const blob = await response.blob()

        // Créer un nom de fichier propre (utiliser customName si disponible, sinon fileName)
        let fileName = cv.customName || cv.fileName || 'CV_Arthur_Jenck'

        // S'assurer que le fichier a l'extension .pdf
        if (!fileName.toLowerCase().endsWith('.pdf')) {
            fileName += '.pdf'
        }

        // Encoder le nom de fichier pour les caractères spéciaux
        const encodedFileName = encodeURIComponent(fileName)

        // Retourner le fichier avec les headers appropriés pour forcer le téléchargement
        return new NextResponse(blob, {
            headers: {
                'Content-Type': 'application/pdf',
                // Utiliser les deux formats pour une meilleure compatibilité
                'Content-Disposition': `attachment; filename="${fileName}"; filename*=UTF-8''${encodedFileName}`,
                'Cache-Control': 'public, max-age=3600', // Cache 1 heure
            },
        })
    },
    { errorMessage: 'Failed to download CV' },
)
