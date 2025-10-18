"use client"

import PlaceHolder from "../assets/images/hero-placeholder.png"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

// Chemins vers les vidéos dans le dossier public
const BG_Webm = "/videos/portfolio-bg.webm"
const BG_Mp4 = "/videos/portfolio-bg.mp4"

// Bug de lecture des vidéos sur Safari & iPhone
const isSafari = () => {
    if (typeof window === "undefined") return false
    const ua = navigator.userAgent.toLowerCase()
    return ua.indexOf("safari") > -1 && ua.indexOf("chrome") < 0
}

const HeroVid = () => {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [shouldUseImg, setShouldUseImg] = useState(false)

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
                video.setAttribute("muted", "true")
                video.setAttribute("playsinline", "true")
                video.setAttribute("autoplay", "true")

                // Pour Safari, forcer aussi les attributs webkit
                if (isSafari()) {
                    video.setAttribute("webkit-playsinline", "true")
                    video.setAttribute("x-webkit-airplay", "deny")

                    await new Promise((resolve) => setTimeout(resolve, 100))
                }

                // Attendre que la vidéo soit chargée
                if (video.readyState < 2) {
                    await new Promise((resolve) => {
                        video.addEventListener("loadeddata", resolve, {
                            once: true,
                        })
                    })
                }

                // Forcer le play() après navigation ou au montage
                await video.play()
            } catch (error) {
                console.warn(
                    "Vidéo ne peut pas être lancée, fallback image:",
                    error
                )
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

    if (shouldUseImg) {
        return (
            <Image
                src={PlaceHolder}
                alt="Image de fond"
                className="hero-bg"
                fill
                priority
                style={{ objectFit: "cover" }}
            />
        )
    }

    return (
        <video
            ref={videoRef}
            className="size-full object-cover absolute top-0 left-0 z-[-1] brightness-30"
            loop
            muted
            autoPlay
            playsInline
            aria-hidden="true"
        >
            <source src={BG_Webm} type="video/webm" />
            <source src={BG_Mp4} type="video/mp4" />
        </video>
    )
}

export default HeroVid
