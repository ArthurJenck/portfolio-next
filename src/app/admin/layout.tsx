import type { Metadata } from 'next'
import './admin.css'

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
    return children
}
