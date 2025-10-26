import type { Metadata } from 'next'
import { Sora } from 'next/font/google'
import '../globals.css'
import { QueryProvider } from '@/providers/QueryProvider'

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
            <body className={sora.className}>
                <div
                    className="fixed inset-0 h-svh -z-10 top-svh"
                    style={{
                        background: 'var(--primary)',
                        backgroundImage: `radial-gradient(circle, rgba(120, 120, 120, 0.2) 1px, transparent 1px)`,
                        backgroundSize: '30px 30px',
                        backgroundPosition: '0 0',
                    }}
                />
                <QueryProvider>{children}</QueryProvider>
            </body>
        </html>
    )
}
