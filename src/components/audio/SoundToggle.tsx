'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAmbientAudio } from '@/providers/ambient-audio-context'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsCompactNav } from '@/hooks/useIsCompactNav'
import './SoundToggle.scss'

// Repris des barres du burger : 48 × 5 px, et 25 × 3 px sous 1024 px.
const SIZES = {
    full: { width: 48, stroke: 5, amplitude: 8 },
    compact: { width: 25, stroke: 3, amplitude: 4.5 },
} as const

type Size = (typeof SIZES)[keyof typeof SIZES]

const POINTS = 40
const SENSITIVITY = 2.6
const SMOOTHING = 0.07
const HISTORY_MS = 600

const boxHeight = (size: Size) => size.amplitude * 2 + size.stroke
const startX = (size: Size) => size.stroke / 2
const lineWidth = (size: Size) => size.width - size.stroke
const centerY = (size: Size) => boxHeight(size) / 2

const flatPath = (size: Size) => `M${startX(size)} ${centerY(size)} L${startX(size) + lineWidth(size)} ${centerY(size)}`

const SoundToggle = () => {
    const { enabled, toggle, getAnalyser, getOutputLatencyMs } = useAmbientAudio()
    const prefersReducedMotion = usePrefersReducedMotion()
    const isCompact = useIsCompactNav()
    const pathRef = useRef<SVGPathElement>(null)
    const reducedRef = useRef(prefersReducedMotion)
    const size = isCompact ? SIZES.compact : SIZES.full
    const sizeRef = useRef<Size>(size)

    reducedRef.current = prefersReducedMotion
    sizeRef.current = size

    useEffect(() => {
        let frame = 0
        let amplitude = 0
        let phase = 0
        let lastTime = 0
        let buffer: Float32Array<ArrayBuffer> | null = null
        const history: { t: number; v: number }[] = []

        const draw = (timestamp: number) => {
            frame = requestAnimationFrame(draw)
            const dt = lastTime ? Math.min(0.1, (timestamp - lastTime) / 1000) : 0.016
            lastTime = timestamp

            const analyser = getAnalyser()
            let rms = 0
            if (analyser) {
                if (!buffer || buffer.length !== analyser.fftSize) buffer = new Float32Array(analyser.fftSize)
                analyser.getFloatTimeDomainData(buffer)
                let sum = 0
                for (let i = 0; i < buffer.length; i++) sum += buffer[i] * buffer[i]
                rms = Math.sqrt(sum / buffer.length)
            }

            const raw = Math.min(1, Math.pow(rms * SENSITIVITY * 3, 0.5))

            // L'analyseur observe le graphe, pas les haut-parleurs : sans ce retard
            // l'onde précède le son de toute la latence de sortie (~290 ms en Bluetooth).
            history.push({ t: timestamp, v: raw })
            while (history.length && history[0].t < timestamp - HISTORY_MS) history.shift()

            const delay = getOutputLatencyMs()
            let target = raw
            if (delay > 1) {
                const at = timestamp - delay
                for (let i = history.length - 1; i >= 0; i--) {
                    if (history[i].t <= at) {
                        target = history[i].v
                        break
                    }
                }
            }

            amplitude += (target - amplitude) * (1 - Math.exp(-dt / SMOOTHING))
            const speed = reducedRef.current ? 0.35 : 1
            phase += (0.5 + amplitude * 2.6) * dt * 3.6 * speed

            const current = sizeRef.current
            const x0 = startX(current)
            const span = lineWidth(current)
            const axis = centerY(current)

            let d = ''
            for (let i = 0; i < POINTS; i++) {
                const t = i / (POINTS - 1)
                const y = axis + Math.sin(t * 7.2 - phase) * amplitude * current.amplitude * Math.sin(Math.PI * t)
                d += `${i === 0 ? 'M' : 'L'}${(x0 + t * span).toFixed(2)} ${y.toFixed(2)} `
            }
            pathRef.current?.setAttribute('d', d)
        }

        frame = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(frame)
    }, [getAnalyser, getOutputLatencyMs])

    return (
        <div className="sound-toggle-wrap relative z-7">
            <span className="sound-toggle-label" aria-hidden="true">
                {enabled ? 'Désactiver le son' : 'Activer le son'}
            </span>
            <motion.button
                type="button"
                onClick={toggle}
                aria-pressed={enabled}
                aria-label={enabled ? 'Couper l’ambiance sonore' : 'Activer l’ambiance sonore'}
                className="sound-toggle cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                <svg
                    width={size.width}
                    height={boxHeight(size)}
                    viewBox={`0 0 ${size.width} ${boxHeight(size)}`}
                    aria-hidden="true"
                >
                    <path ref={pathRef} d={flatPath(size)} strokeWidth={size.stroke} />
                </svg>
            </motion.button>
        </div>
    )
}

export default SoundToggle
