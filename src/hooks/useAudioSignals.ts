'use client'

import { useEffect, useRef } from 'react'
import { useScroll } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useAmbientAudio } from '@/providers/ambient-audio-context'

const ACTIVITY_DECAY = 0.6
const IDLE_MS = 12000

export const useAudioSignals = (): void => {
    const { enabled, setParams, pushScroll, markActivity, triggerModulation } = useAmbientAudio()
    const { scrollY } = useScroll()
    const pathname = usePathname()
    const activityRef = useRef(0)
    const lastPointer = useRef({ x: 0, y: 0, t: 0 })
    const firstPath = useRef(true)

    useEffect(() => {
        if (!enabled) return
        if (firstPath.current) {
            firstPath.current = false
            return
        }
        triggerModulation()
    }, [enabled, pathname, triggerModulation])

    useEffect(() => {
        if (!enabled) return

        const readDepth = () => {
            const span = document.documentElement.scrollHeight - window.innerHeight
            return span > 0 ? Math.min(1, window.scrollY / span) : 0
        }

        let frame = 0
        let lastMove = performance.now()

        // Le souffle suit le déplacement réel de la page plutôt que les événements
        // wheel : le carousel de projets se pilote au deltaX et au drag, qui
        // n'émettent aucun deltaY mais déplacent bien window.scrollY.
        let lastScrollY = window.scrollY

        const loop = (now: number) => {
            frame = requestAnimationFrame(loop)

            const y = window.scrollY
            const travelled = Math.abs(y - lastScrollY)
            lastScrollY = y
            if (travelled > 0.5) pushScroll(travelled)

            const idle = now - lastMove > IDLE_MS
            if (idle) activityRef.current *= 0.995
            setParams({ depth: readDepth(), activity: activityRef.current })
        }
        frame = requestAnimationFrame(loop)

        const onPointerMove = (event: PointerEvent) => {
            const now = performance.now()
            const previous = lastPointer.current
            const dt = now - previous.t
            if (previous.t && dt > 0) {
                const distance = Math.hypot(event.clientX - previous.x, event.clientY - previous.y)
                const speed = Math.min(1, distance / dt / 2.2)
                activityRef.current = Math.max(activityRef.current * ACTIVITY_DECAY, speed)
                lastMove = now
                if (speed > 0.05) markActivity()
            }
            lastPointer.current = { x: event.clientX, y: event.clientY, t: now }
        }

        window.addEventListener('pointermove', onPointerMove, { passive: true })

        return () => {
            cancelAnimationFrame(frame)
            window.removeEventListener('pointermove', onPointerMove)
        }
    }, [enabled, setParams, pushScroll, markActivity, scrollY])
}
