'use client'

import PlaceHolder from '../../assets/images/hero-placeholder.png'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useVideoDistortion } from './useVideoDistortion'
import { onHeroPlay } from '@/lib/hero-playback'
import { SAFARI_PLAY_DELAY_MS } from './header.config'

// Chemins vers les vidéos dans le dossier public
const BG_Webm = '/videos/portfolio-bg.webm'
const BG_Mp4 = '/videos/portfolio-bg.mp4'

// Bug de lecture des vidéos sur Safari & iPhone
const isSafari = () => {
    if (typeof window === 'undefined') return false
    const ua = navigator.userAgent.toLowerCase()
    return ua.indexOf('safari') > -1 && ua.indexOf('chrome') < 0
}

const HeroVid = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [shouldUseImg, setShouldUseImg] = useState(false)
    const [distortionEnabled, setDistortionEnabled] = useState(false)
    const [canvasReady, setCanvasReady] = useState(false)

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
        setDistortionEnabled(!reducedMotion && hasFinePointer)
    }, [])

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        let cancelled = false

        const startVideo = async () => {
            try {
                // Force les attributs manuellement pour Safari/iOS
                // Safari ne respecte pas toujours les attributs JSX React
                video.muted = true
                video.playsInline = true
                video.setAttribute('muted', 'true')
                video.setAttribute('playsinline', 'true')

                // Pour Safari, forcer aussi les attributs webkit
                if (isSafari()) {
                    video.setAttribute('webkit-playsinline', 'true')
                    video.setAttribute('x-webkit-airplay', 'deny')

                    await new Promise((resolve) => setTimeout(resolve, SAFARI_PLAY_DELAY_MS))
                }

                if (cancelled) return

                await video.play()
            } catch (error) {
                console.warn('Vidéo ne peut pas être lancée, fallback image:', error)
                if (!cancelled) setShouldUseImg(true)
            }
        }

        const unsubscribe = onHeroPlay(startVideo)

        // Cleanup
        return () => {
            cancelled = true
            unsubscribe()
            video.pause()
        }
    }, [])

    const handleCanvasReady = useCallback(() => setCanvasReady(true), [])

    useVideoDistortion(containerRef, videoRef, canvasRef, distortionEnabled && !shouldUseImg, handleCanvasReady)

    if (shouldUseImg) {
        return (
            <Image
                src={PlaceHolder}
                alt="Fond animé du portfolio d'Arthur Jenck"
                className="hero-bg"
                fill
                priority
                style={{ objectFit: 'cover' }}
            />
        )
    }

    return (
        <div ref={containerRef} className="absolute top-0 left-0 size-full z-[-1]">
            <video
                ref={videoRef}
                className={`size-full object-cover absolute top-0 left-0 brightness-30 ${
                    canvasReady ? 'invisible' : ''
                }`}
                loop
                muted
                playsInline
                preload="metadata"
                poster="/videos/portfolio-bg-poster.jpg"
                aria-hidden="true"
            >
                <source src={BG_Webm} type="video/webm" />
                <source src={BG_Mp4} type="video/mp4" />
            </video>
            {distortionEnabled && (
                <canvas
                    ref={canvasRef}
                    aria-hidden="true"
                    className={`size-full absolute top-0 left-0 brightness-30 ${canvasReady ? '' : 'invisible'}`}
                />
            )}
        </div>
    )
}

export default HeroVid
