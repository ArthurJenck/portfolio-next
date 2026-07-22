'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import LogoLottie from './LogoLottie'
import './SiteLoader.scss'

const STORAGE_KEY = 'site-loaded'
const TIMEOUT_MS = 6000
const EXIT_DURATION_MS = 400

const waitForWindowLoad = (): Promise<void> =>
    new Promise((resolve) => {
        if (document.readyState === 'complete') {
            resolve()
            return
        }
        window.addEventListener('load', () => resolve(), { once: true })
    })

const waitForTimeout = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

// Attend que la vidéo (ou l'image de secours) du hero soit prête à être affichée
const waitForHeroMedia = (): Promise<void> =>
    new Promise((resolve) => {
        let settled = false
        const done = () => {
            if (settled) return
            settled = true
            resolve()
        }

        const checkExisting = () => {
            const video = document.querySelector<HTMLVideoElement>('header video')
            if (video) {
                if (video.readyState >= 2) done()
                else video.addEventListener('loadeddata', done, { once: true })
                return true
            }
            const img = document.querySelector<HTMLImageElement>('header .hero-bg')
            if (img) {
                if (img.complete) done()
                else {
                    img.addEventListener('load', done, { once: true })
                    img.addEventListener('error', done, { once: true })
                }
                return true
            }
            return false
        }

        if (checkExisting()) return
        const interval = setInterval(() => {
            if (checkExisting()) clearInterval(interval)
        }, 100)
    })

// Attend que l'image de couverture d'une page projet soit prête à être affichée
const waitForCoverMedia = (): Promise<void> =>
    new Promise((resolve) => {
        let settled = false
        const done = () => {
            if (settled) return
            settled = true
            resolve()
        }

        const checkExisting = () => {
            const img = document.querySelector<HTMLImageElement>('.cover-image')
            if (img) {
                if (img.complete) done()
                else {
                    img.addEventListener('load', done, { once: true })
                    img.addEventListener('error', done, { once: true })
                }
                return true
            }
            return false
        }

        if (checkExisting()) return
        const interval = setInterval(() => {
            if (checkExisting()) clearInterval(interval)
        }, 100)
    })

type LoaderPhase = 'loading' | 'exiting' | 'done'

const SiteLoader = () => {
    const pathname = usePathname()
    const [phase, setPhase] = useState<LoaderPhase>('loading')
    const [reducedMotion, setReducedMotion] = useState(false)
    const readyRef = useRef(false)
    const reducedMotionRef = useRef(false)

    const exit = () => {
        document.documentElement.classList.remove('loader-active')
        setPhase('exiting')
        window.setTimeout(() => {
            try {
                sessionStorage.setItem(STORAGE_KEY, '1')
            } catch {
                // sessionStorage indisponible (navigation privée stricte) : tant pis, le loader rejouera
            }
            setPhase('done')
        }, EXIT_DURATION_MS)
    }

    useEffect(() => {
        let alreadySeen = false
        try {
            alreadySeen = sessionStorage.getItem(STORAGE_KEY) === '1'
        } catch {
            // idem : on considère la page comme jamais vue
        }

        if (alreadySeen) {
            setPhase('done')
            return
        }

        const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        reducedMotionRef.current = reduced
        setReducedMotion(reduced)

        const isHome = pathname === '/'
        const mediaReady = isHome ? waitForHeroMedia() : waitForCoverMedia()

        Promise.race([Promise.all([waitForWindowLoad(), mediaReady]), waitForTimeout(TIMEOUT_MS)]).then(() => {
            readyRef.current = true
            // En reduced motion, l'anim ne boucle pas : on sort dès que la page est prête
            if (reducedMotionRef.current) exit()
        })
    }, [pathname])

    const handleLoopComplete = () => {
        if (readyRef.current) exit()
    }

    if (phase === 'done') return null

    return (
        <div className={`site-loader${phase === 'exiting' ? ' is-exiting' : ''}`} aria-hidden="true">
            <LogoLottie
                onLoopComplete={handleLoopComplete}
                autoplay={!reducedMotion}
                isExiting={phase === 'exiting'}
            />
        </div>
    )
}

export default SiteLoader
