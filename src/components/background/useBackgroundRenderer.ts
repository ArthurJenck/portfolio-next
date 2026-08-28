'use client'

import { useEffect } from 'react'
import type { RefObject } from 'react'
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three'
import {
    BASE_ASPECT,
    BASE_FOV,
    CAMERA_FAR,
    CAMERA_NEAR,
    DEG_TO_RAD,
    DPR_CAP,
    MAX_DELTA_S,
    MAX_FOV,
    MOBILE_FRAME_MS,
    MS_PER_SECOND,
    POINTER_QUERY,
    POINTER_TAU,
    RAD_TO_DEG,
    SCROLL_TAU,
} from './background.config'
import type { SceneController, SceneFactory } from './scene.types'

// Élargit le champ vertical quand le viewport est plus étroit que le format de référence,
// de façon à conserver la largeur de scène visible.
const fovForAspect = (aspect: number) => {
    const baseHalfHeight = Math.tan((BASE_FOV / 2) * DEG_TO_RAD)
    return Math.atan((baseHalfHeight * BASE_ASPECT) / aspect) * RAD_TO_DEG * 2
}

const scrollProgress = () => {
    const span = document.documentElement.scrollHeight - window.innerHeight
    if (span <= 0) return 0
    return Math.min(1, Math.max(0, window.scrollY / span))
}

// Hauteur scrollable exprimée en écrans. Relue à chaque frame plutôt que mémorisée : la
// page grandit encore après le premier rendu, au fil du chargement des médias.
const scrollViewportsTotal = () => {
    const height = window.innerHeight
    if (height <= 0) return 0
    return (document.documentElement.scrollHeight - height) / height
}

// Lissage exponentiel indépendant du framerate : deux machines à 30 et 120 fps convergent
// à la même vitesse réelle.
const damp = (current: number, target: number, tau: number, delta: number) =>
    current + (target - current) * (1 - Math.exp(-delta / tau))

type BackgroundRendererOptions = {
    containerRef: RefObject<HTMLDivElement | null>
    hostRef: RefObject<HTMLDivElement | null>
    sentinelRef: RefObject<HTMLDivElement | null>
    active: boolean
    isMobile: boolean
    createScene: SceneFactory
    onReady: () => void
    onContextLost: () => void
}

export const useBackgroundRenderer = ({
    containerRef,
    hostRef,
    sentinelRef,
    active,
    isMobile,
    createScene,
    onReady,
    onContextLost,
}: BackgroundRendererOptions) => {
    useEffect(() => {
        if (!active) return

        const container = containerRef.current
        const host = hostRef.current
        const sentinel = sentinelRef.current
        if (!container || !host || !sentinel) return

        let renderer: WebGLRenderer
        try {
            renderer = new WebGLRenderer({ alpha: true, antialias: !isMobile, powerPreference: 'low-power' })
        } catch {
            onContextLost()
            return
        }
        renderer.setClearAlpha(0)

        // On laisse three créer son propre canvas plutôt que de lui en confier un rendu par
        // React : chaque montage repart d'un contexte neuf. Sinon, le forceContextLoss du
        // cleanup condamnerait définitivement le canvas, et le remontage que StrictMode
        // provoque en dev retomberait sur un contexte mort.
        const canvas = renderer.domElement
        host.appendChild(canvas)

        const scene = new Scene()
        const camera = new PerspectiveCamera(BASE_FOV, 1, CAMERA_NEAR, CAMERA_FAR)

        let controller: SceneController
        try {
            controller = createScene({ scene, camera, isMobile })
        } catch {
            renderer.dispose()
            renderer.forceContextLoss()
            canvas.remove()
            onContextLost()
            return
        }

        let rafId = 0
        let armed = false
        let visible = !document.hidden
        let readyFired = false
        let lastTime = 0
        let smoothProgress = 0
        let smoothingStarted = false
        let pointerTargetX = 0
        let pointerTargetY = 0
        let pointerX = 0
        let pointerY = 0

        const frameCapMs = isMobile ? MOBILE_FRAME_MS : 0
        const pointerEnabled = !isMobile && window.matchMedia(POINTER_QUERY).matches

        const resize = () => {
            const width = Math.max(1, container.clientWidth)
            const height = Math.max(1, container.clientHeight)
            const aspect = width / height

            renderer.setPixelRatio(isMobile ? 1 : Math.min(window.devicePixelRatio || 1, DPR_CAP))
            renderer.setSize(width, height, false)

            camera.aspect = aspect
            camera.fov = aspect >= BASE_ASPECT ? BASE_FOV : Math.min(MAX_FOV, fovForAspect(aspect))
            camera.updateProjectionMatrix()
        }

        resize()

        const render = (time: number) => {
            const due = !frameCapMs || !lastTime || time - lastTime >= frameCapMs

            if (due) {
                const delta = lastTime ? Math.min((time - lastTime) / MS_PER_SECOND, MAX_DELTA_S) : 0
                lastTime = time

                const target = scrollProgress()
                if (smoothingStarted) {
                    smoothProgress = damp(smoothProgress, target, SCROLL_TAU, delta)
                    pointerX = damp(pointerX, pointerTargetX, POINTER_TAU, delta)
                    pointerY = damp(pointerY, pointerTargetY, POINTER_TAU, delta)
                } else {
                    // Première frame : on se cale sur la position réelle plutôt que d'animer
                    // depuis le haut de la page, sinon un rechargement en cours de page
                    // déclenche un long travelling parasite.
                    smoothProgress = target
                    smoothingStarted = true
                }

                const viewportsTotal = scrollViewportsTotal()
                controller.update({
                    progress: smoothProgress,
                    viewports: smoothProgress * viewportsTotal,
                    viewportsTotal,
                    delta,
                    pointerX,
                    pointerY,
                })
                renderer.render(scene, camera)

                if (!readyFired) {
                    readyFired = true
                    onReady()
                }
            }

            if (armed && visible) {
                rafId = requestAnimationFrame(render)
            } else {
                rafId = 0
            }
        }

        const startLoop = () => {
            if (!rafId && armed && visible) {
                // Repartir de zéro évite un delta-time énorme après une mise en pause.
                lastTime = 0
                rafId = requestAnimationFrame(render)
            }
        }

        const stopLoop = () => {
            if (rafId) {
                cancelAnimationFrame(rafId)
                rafId = 0
            }
        }

        const handleVisibility = () => {
            visible = !document.hidden
            if (visible) startLoop()
            else stopLoop()
        }

        const handlePointerMove = (event: PointerEvent) => {
            pointerTargetX = (event.clientX / window.innerWidth) * 2 - 1
            pointerTargetY = (event.clientY / window.innerHeight) * 2 - 1
        }

        // Le contexte perdu n'est pas repris : reconstruire toute la scène pour un cas qui
        // signale surtout une machine à bout coûterait plus qu'il ne rapporte. On rend la
        // main au fond pointillé, qui ne consomme rien.
        const handleContextLost = (event: Event) => {
            event.preventDefault()
            stopLoop()
            onContextLost()
        }

        const resizeObserver = new ResizeObserver(resize)
        resizeObserver.observe(container)

        // La sentinelle ne peut sortir du viewport que par le haut : un top négatif
        // signifie donc que le hero est franchi et que la scène devient visible.
        const startObserver = new IntersectionObserver(([entry]) => {
            armed = entry.boundingClientRect.top < 0
            if (armed) startLoop()
            else stopLoop()
        })
        startObserver.observe(sentinel)

        document.addEventListener('visibilitychange', handleVisibility)
        canvas.addEventListener('webglcontextlost', handleContextLost)
        if (pointerEnabled) window.addEventListener('pointermove', handlePointerMove, { passive: true })

        return () => {
            stopLoop()
            resizeObserver.disconnect()
            startObserver.disconnect()
            document.removeEventListener('visibilitychange', handleVisibility)
            window.removeEventListener('pointermove', handlePointerMove)
            // Retiré avant forceContextLoss, qui émettrait sinon l'événement au démontage.
            canvas.removeEventListener('webglcontextlost', handleContextLost)

            controller.dispose()
            renderer.dispose()
            renderer.forceContextLoss()
            canvas.remove()
        }
    }, [active, isMobile, containerRef, hostRef, sentinelRef, createScene, onReady, onContextLost])
}
