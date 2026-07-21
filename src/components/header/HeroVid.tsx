'use client'

import PlaceHolder from '../../assets/images/hero-placeholder.png'
import { useState, useEffect, useRef, useCallback } from 'react'
import Image from 'next/image'
import { useVideoDistortion } from './useVideoDistortion'

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

        const initVideo = async () => {
            try {
                // Force les attributs manuellement pour Safari/iOS
                // Safari ne respecte pas toujours les attributs JSX React
                video.muted = true
                video.playsInline = true
                video.autoplay = true
                video.setAttribute('muted', 'true')
                video.setAttribute('playsinline', 'true')
                video.setAttribute('autoplay', 'true')

                // Pour Safari, forcer aussi les attributs webkit
                if (isSafari()) {
                    video.setAttribute('webkit-playsinline', 'true')
                    video.setAttribute('x-webkit-airplay', 'deny')

                    await new Promise((resolve) => setTimeout(resolve, 100))
                }

                // Attendre que la vidéo soit chargée
                if (video.readyState < 2) {
                    await new Promise((resolve) => {
                        video.addEventListener('loadeddata', resolve, {
                            once: true,
                        })
                    })
                }

                // Forcer le play() après navigation ou au montage
                await video.play()
            } catch (error) {
                console.warn('Vidéo ne peut pas être lancée, fallback image:', error)
                setShouldUseImg(true)
            }
        }

        // Lancer l'initialisation
        initVideo()

        // Cleanup
        return () => {
            if (video) {
                video.pause()
            }
        }
    }, [])

    const handleCanvasReady = useCallback(() => setCanvasReady(true), [])

    useVideoDistortion(containerRef, videoRef, canvasRef, distortionEnabled && !shouldUseImg, handleCanvasReady)

    if (shouldUseImg) {
        return (
            <Image
                src={PlaceHolder}
                alt="Image de fond"
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
                autoPlay
                playsInline
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
