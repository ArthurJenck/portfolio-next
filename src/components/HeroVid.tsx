"use client"

import PlaceHolder from "../assets/images/hero-placeholder.png"
import { useState, useEffect, useRef } from "react"
import "../styles/HeroVid.scss"
import Image from "next/image"

// Chemins vers les vidéos dans le dossier public
const BG_Webm = "/videos/portfolio-bg.webm"
const BG_Mp4 = "/videos/portfolio-bg.mp4"

// Bug de lecture des vidéos sur Safari & iphone
const isSafari = () => {
    const ua = navigator.userAgent.toLowerCase()
    return ua.indexOf("safar") > -1 && ua.indexOf("chrome") < 0
}

const HeroVid = () => {
    const ref = useRef<HTMLDivElement>(null)
    const [shouldUseImg, setShouldUseImg] = useState(false)

    useEffect(() => {
        // Les attributs doivent être forcés afin que la vidéo se lance sur les appareils Apple
        if (isSafari() && ref.current) {
            const player = ref.current.children[0] as HTMLVideoElement
            if (player) {
                player.controls = false
                player.playsInline = true
                player.muted = true
                player.setAttribute("muted", "")

                // On vérifie si la vidéo se joue bien, sinon on affiche l'image de remplacement
                setTimeout(() => {
                    player
                        .play()
                        .then(() => {})
                        .catch(() => {
                            ref.current!.style.display = "none"
                            setShouldUseImg(true)
                        })
                }, 0)
            }
        }
    }, [])

    // Selon si on devrait utiliser l'image ou non, on affiche soit le placeholder soit la vidéo
    return shouldUseImg ? (
        <Image
            src={PlaceHolder}
            alt="Image de fond"
            className="hero-bg"
            fill
            priority
            style={{ objectFit: "cover" }}
        />
    ) : (
        <div
            ref={ref}
            dangerouslySetInnerHTML={{
                __html: `
                <video
                loop
                muted
                autoplay
                playsinline
                class="hero-bg"
                aria-hidden="true"
                >
                <source src="${BG_Webm}" type="video/webm" />
                <source src="${BG_Mp4}" type="video/mp4" />
            `,
            }}
        ></div>
    )
}

export default HeroVid
