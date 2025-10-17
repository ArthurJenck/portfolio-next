import type { Metadata } from "next"
import { Sora } from "next/font/google"
import "./globals.css"

const sora = Sora({
    subsets: ["latin"],
    weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
    display: "swap",
})

export const metadata: Metadata = {
    title: "Arthur Jenck",
    description:
        "Portfolio d'Arthur Jenck, développeur web front-end passionné spécialisé React, expert en UX/UI et Webdesign.",
    robots: "index",
    openGraph: {
        title: "Portfolio d'Arthur Jenck, Développeur Web Front-end",
        type: "website",
        url: "https://arthurjenck.com/",
        description:
            "Portfolio d'Arthur Jenck, développeur web front-end passionné spécialisé React, expert en UX/UI et Webdesign.",
        images: [
            {
                url: "https://i.ibb.co/r6Pk1wC/share-preview.png",
            },
        ],
    },
    twitter: {
        card: "summary_large_image",
        site: "@ArthurJenck",
        title: "Portfolio d'Arthur Jenck, Développeur Web Front-end",
        description:
            "Portfolio d'Arthur Jenck, développeur web front-end passionné spécialisé React, expert en UX/UI et Webdesign.",
        images: ["https://i.ibb.co/r6Pk1wC/share-preview.png"],
    },
    icons: {
        icon: [
            { url: "/favicon.ico", type: "image/x-icon" },
            { url: "/favicon.svg", type: "image/svg+xml" },
        ],
    },
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="fr">
            <head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://arthurjenck.com/",
                            "@type": "WebSite",
                            name: "Arthur Jenck – Portfolio",
                            url: "https://arthurjenck.com/",
                        }),
                    }}
                />
            </head>
            <body className={sora.className}>{children}</body>
        </html>
    )
}
