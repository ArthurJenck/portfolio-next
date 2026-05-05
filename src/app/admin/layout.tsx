import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import '@/app/globals.css'
import './admin.css'

const sora = Sora({
    subsets: ['latin'],
    weight: ['100', '200', '300', '400', '500', '600', '700', '800'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: 'Admin – Arthur Jenck',
    description: "Interface d'administration du portfolio",
    robots: 'noindex, nofollow',
}

export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr" data-scroll-behavior="smooth">
            <body className={sora.className}>{children}</body>
        </html>
    )
}
