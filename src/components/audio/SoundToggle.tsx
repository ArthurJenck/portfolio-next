'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useAmbientAudio } from '@/providers/ambient-audio-context'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { useIsCompactNav } from '@/hooks/useIsCompactNav'
import './SoundToggle.scss'
import {
    DEFAULT_DT_SECONDS,
    HISTORY_MS,
    MAX_DT_SECONDS,
    MS_PER_SECOND,
    PHASE_AMPLITUDE_GAIN,
    PHASE_BASE_SPEED,
    PHASE_SPEED_SCALE,
    POINTS,
    REDUCED_MOTION_SPEED,
    RMS_CURVE_EXPONENT,
    RMS_GAIN,
    SENSITIVITY,
    SMOOTHING,
    WAVE_FREQUENCY,
} from './soundToggle.config'

// Repris des barres du burger : 48 × 5 px, et 25 × 3 px sous 1024 px.
const SIZES = {
    full: { width: 48, stroke: 5, amplitude: 8 },
    compact: { width: 25, stroke: 3, amplitude: 4.5 },
} as const

type Size = (typeof SIZES)[keyof typeof SIZES]

const boxHeight = (size: Size) => size.amplitude * 2 + size.stroke
const startX = (size: Size) => size.stroke / 2
const lineWidth = (size: Size) => size.width - size.stroke
const centerY = (size: Size) => boxHeight(size) / 2

const flatPath = (size: Size) => `M${startX(size)} ${centerY(size)} L${startX(size) + lineWidth(size)} ${centerY(size)}`

const SoundToggle = () => {
    const { enabled, toggle, getAnalyser, getOutputLatencyMs, currentTrackLabel } = useAmbientAudio()
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
            const dt = lastTime ? Math.min(MAX_DT_SECONDS, (timestamp - lastTime) / MS_PER_SECOND) : DEFAULT_DT_SECONDS
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

            const raw = Math.min(1, Math.pow(rms * SENSITIVITY * RMS_GAIN, RMS_CURVE_EXPONENT))

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
            const speed = reducedRef.current ? REDUCED_MOTION_SPEED : 1
            phase += (PHASE_BASE_SPEED + amplitude * PHASE_AMPLITUDE_GAIN) * dt * PHASE_SPEED_SCALE * speed

            const current = sizeRef.current
            const x0 = startX(current)
            const span = lineWidth(current)
            const axis = centerY(current)

            let d = ''
            for (let i = 0; i < POINTS; i++) {
                const t = i / (POINTS - 1)
                const y = axis + Math.sin(t * WAVE_FREQUENCY - phase) * amplitude * current.amplitude * Math.sin(Math.PI * t)
                d += `${i === 0 ? 'M' : 'L'}${(x0 + t * span).toFixed(2)} ${y.toFixed(2)} `
            }
            pathRef.current?.setAttribute('d', d)
        }

        frame = requestAnimationFrame(draw)
        return () => cancelAnimationFrame(frame)
    }, [getAnalyser, getOutputLatencyMs])

    return (
        <div className="sound-toggle-wrap relative z-7">
            {enabled && currentTrackLabel && (
                <span className="sound-toggle-label sound-toggle-label--track" role="status">
                    {currentTrackLabel}
                </span>
            )}
            <span className="sound-toggle-label sound-toggle-label--action" aria-hidden="true">
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
