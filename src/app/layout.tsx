import type { Metadata } from "next"
import "../styles/main.scss"

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
            { url: "/favicon.ico" },
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
            <body>{children}</body>
        </html>
    )
}
