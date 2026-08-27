import type { Metadata } from 'next'
import '@/styles/globals.css'
import { cn } from '@/lib/utils'
import { sora, montserrat } from '@/config/fonts'
import { SITE_URL } from '@/config/site'

export const metadata: Metadata = {
    metadataBase: new URL(SITE_URL),
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr" data-scroll-behavior="smooth" suppressHydrationWarning>
            <body className={cn('overflow-x-hidden', sora.className, sora.variable, montserrat.variable)}>
                {children}
            </body>
        </html>
    )
}
