import type { Metadata } from 'next'
import DottedBackground from '@/components/ui/DottedBackground'
import { SHARE_IMAGE_URL, SITE_URL } from '@/config/site'

export const metadata: Metadata = {
    title: 'Arthur Jenck • CV',
    description:
        "CV d'Arthur Jenck, développeur web front-end spécialisé en NextJS, React, TypeScript et Tailwind. Expertise en UX/UI et Webdesign.",
    robots: 'index, follow',
    openGraph: {
        title: 'CV - Arthur Jenck, Développeur Web Front-end',
        description:
            "CV d'Arthur Jenck, développeur web front-end spécialisé en NextJS, React, TypeScript et Tailwind.",
        url: `${SITE_URL}/cv`,
        siteName: 'Arthur Jenck',
        type: 'website',
        locale: 'fr_FR',
        images: [{ url: SHARE_IMAGE_URL }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'CV - Arthur Jenck, Développeur Web Front-end',
        description:
            "CV d'Arthur Jenck, développeur web front-end spécialisé en NextJS, React, TypeScript et Tailwind.",
        images: [SHARE_IMAGE_URL],
    },
    alternates: {
        canonical: `${SITE_URL}/cv`,
    },
}

export default function CVLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <div className="h-svh overflow-hidden">
            <DottedBackground />
            {children}
        </div>
    )
}
