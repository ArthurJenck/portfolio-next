'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AmbientAudioContext, type AmbientAudioValue } from './ambient-audio-context'
import SfxDelegate from '@/components/audio/SfxDelegate'
import type { AmbientEngine } from '@/lib/audio/engine'
import type { AmbientParams } from '@/lib/audio/audio.types'

const MUTE_KEY = 'ambient-sound-muted'
const GESTURES = ['pointerdown', 'keydown', 'touchstart'] as const

type Props = {
    children: ReactNode
}

const AudioProvider = ({ children }: Props) => {
    const engineRef = useRef<AmbientEngine | null>(null)
    const pendingParams = useRef<Partial<AmbientParams>>({})
    const bootRef = useRef<Promise<void> | null>(null)
    const wantedRef = useRef(false)
    const [enabled, setEnabled] = useState(false)
    const [ready, setReady] = useState(false)

    // Sans ce verrou, deux appels concurrents passent tous les deux le test
    // `engineRef.current` avant que l'import dynamique ne résolve : le premier
    // moteur devient orphelin et joue indéfiniment, hors de portée de stop().
    const boot = useCallback(async () => {
        if (!bootRef.current) {
            bootRef.current = import('@/lib/audio/engine').then(({ AmbientEngine }) => {
                const engine = new AmbientEngine()
                engineRef.current = engine
                if (Object.keys(pendingParams.current).length) engine.setParams(pendingParams.current)
            })
        }
        await bootRef.current
        if (!wantedRef.current) return
        await engineRef.current?.start()
        setReady(true)
    }, [])

    const apply = useCallback(
        (next: boolean) => {
            wantedRef.current = next
            setEnabled(next)
            if (next) void boot()
            else engineRef.current?.stop()
        },
        [boot],
    )

    // Seul le refus est mémorisé, et seulement le temps de l'onglet : une nouvelle
    // visite repart avec l'ambiance armée.
    const toggle = useCallback(() => {
        const next = !wantedRef.current
        try {
            if (next) sessionStorage.removeItem(MUTE_KEY)
            else sessionStorage.setItem(MUTE_KEY, '1')
        } catch {
            // stockage indisponible : le refus ne survivra pas au rechargement
        }
        apply(next)
    }, [apply])

    // La politique d'autoplay interdit de démarrer sans geste : le son s'arme au
    // chargement et part au premier geste réel, sauf refus exprimé dans l'onglet.
    useEffect(() => {
        let muted = false
        try {
            muted = sessionStorage.getItem(MUTE_KEY) === '1'
        } catch {
            muted = false
        }
        if (muted) return

        const detach = () => GESTURES.forEach((type) => window.removeEventListener(type, onGesture))

        // Un geste né dans le toggle est laissé à son propre onClick, sinon le
        // pointerdown allumerait le son que le click éteindrait dans la foulée.
        const onGesture = (event: Event) => {
            detach()
            const target = event.target
            if (target instanceof Element && target.closest('.sound-toggle')) return
            apply(true)
        }

        GESTURES.forEach((type) => window.addEventListener(type, onGesture, { passive: true }))
        return detach
    }, [apply])

    useEffect(() => {
        return () => {
            engineRef.current?.dispose()
            engineRef.current = null
            bootRef.current = null
            wantedRef.current = false
        }
    }, [])

    const value = useMemo<AmbientAudioValue>(
        () => ({
            enabled,
            ready,
            toggle,
            getAnalyser: () => engineRef.current?.getAnalyser() ?? null,
            getOutputLatencyMs: () => engineRef.current?.getOutputLatencyMs() ?? 0,
            setParams: (next) => {
                if (engineRef.current) engineRef.current.setParams(next)
                else pendingParams.current = { ...pendingParams.current, ...next }
            },
            pushScroll: (pixels) => engineRef.current?.pushScroll(pixels),
            markActivity: () => engineRef.current?.markActivity(),
            triggerModulation: () => engineRef.current?.triggerModulation(),
            playSfx: (name, options) => engineRef.current?.playSfx(name, options),
            engineRef: () => engineRef.current,
        }),
        [enabled, ready, toggle],
    )

    return (
        <AmbientAudioContext.Provider value={value}>
            <SfxDelegate />
            {children}
        </AmbientAudioContext.Provider>
    )
}

export default AudioProvider
