import type { Metadata } from 'next'
import { MotionProvider } from '@/providers/MotionProvider'
import AudioProvider from '@/providers/AudioProvider'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Analytics } from '@vercel/analytics/next'
import NavBar from '@/components/nav/NavBar'
import Footer from '@/components/footer/Footer'
import SiteLoader from '@/components/loader/SiteLoader'
import SiteBackground from '@/components/background/SiteBackground'
import { SHARE_IMAGE_URL, SITE_URL } from '@/config/site'
import { HOME_DESCRIPTION, HOME_KEYWORDS, HOME_TITLE, personSchema, websiteSchema } from '@/config/seo'

// Ce script doit s'exécuter avant le premier paint (pas de "next/script" ici) pour éviter
// tout flash : il pose la classe qui retient le hero (1re visite) ou masque le loader (déjà vu)
const loaderInitScript = `
try {
    if (sessionStorage.getItem('site-loaded')) {
        document.documentElement.classList.add('loader-seen');
        document.documentElement.classList.add('loader-complete');
    } else {
        document.documentElement.classList.add('loader-active');
    }
} catch (e) {
    document.documentElement.classList.add('loader-active');
}

(() => {
    const gestures = ['pointerdown', 'keydown', 'touchstart'];
    const unlock = () => {
        if (window.__portfolioAudioGestureSeen) return;
        window.__portfolioAudioGestureSeen = true;

        try {
            const Ctor = window.AudioContext || window.webkitAudioContext;
            if (Ctor) {
                let context = window.__portfolioAudioContext;
                if (!context || context.state === 'closed') {
                    context = new Ctor({ latencyHint: 'interactive' });
                    window.__portfolioAudioContext = context;
                }
                const resumed = context.resume();
                if (resumed && typeof resumed.catch === 'function') resumed.catch(() => {});
            }
        } catch (e) {}

        gestures.forEach((type) => window.removeEventListener(type, unlock, true));
    };

    gestures.forEach((type) => window.addEventListener(type, unlock, { capture: true, passive: true }));
})();
`

export const metadata: Metadata = {
    title: {
        default: HOME_TITLE,
        template: '%s · Arthur Jenck',
    },
    description: HOME_DESCRIPTION,
    authors: [{ name: 'Arthur Jenck', url: SITE_URL }],
    creator: 'Arthur Jenck',
    robots: { index: true, follow: true },
    keywords: HOME_KEYWORDS,
    icons: {
        icon: [
            { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
            { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
            { url: '/favicon-light.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: light)' },
            { url: '/favicon-dark.svg', type: 'image/svg+xml', media: '(prefers-color-scheme: dark)' },
        ],
        apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
    },
    manifest: '/site.webmanifest',
    alternates: {
        canonical: SITE_URL,
    },
    openGraph: {
        title: HOME_TITLE,
        siteName: 'Arthur Jenck',
        type: 'website',
        url: `${SITE_URL}/`,
        locale: 'fr_FR',
        description: HOME_DESCRIPTION,
        images: [
            {
                url: SHARE_IMAGE_URL,
                width: 1199,
                height: 630,
                alt: "Portfolio d'Arthur Jenck, développeur créatif & front-end à Paris",
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        site: '@ArthurJenck',
        title: HOME_TITLE,
        description: HOME_DESCRIPTION,
        images: [SHARE_IMAGE_URL],
    },
    appleWebApp: {
        title: 'Arthur Jenck',
        statusBarStyle: 'black-translucent',
        capable: true,
    },
}

export default function SiteLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema()) }}
            />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema()) }} />
            <script dangerouslySetInnerHTML={{ __html: loaderInitScript }} />
            <noscript>
                <style>
                    {'.site-loader { display: none !important; } .hero-typing { width: fit-content !important; animation: none !important; }'}
                </style>
            </noscript>
            <SiteBackground />
            <SiteLoader />
            <MotionProvider>
                <AudioProvider>
                    <div className="min-h-screen flex flex-col">
                        <NavBar />
                        {children}
                        <Footer />
                    </div>
                </AudioProvider>
                {/* TODO: remettre le debug */}
                <Analytics debug={false} />
                <SpeedInsights debug={false} />
            </MotionProvider>
        </>
    )
}
