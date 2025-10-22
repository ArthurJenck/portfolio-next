import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import '../globals.css'

const sora = Sora({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Arthur Jenck – CV',
    description: "CV d'Arthur Jenck, développeur web front-end",
    robots: 'index',
}

export default function CVLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr">
            <body className={sora.className}>{children}</body>
        </html>
    )
}
