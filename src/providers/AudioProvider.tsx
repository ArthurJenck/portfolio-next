'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AmbientAudioContext, type AmbientAudioValue } from './ambient-audio-context'
import SfxDelegate from '@/components/audio/SfxDelegate'
import type { AmbientEngine } from '@/lib/audio/engine'
import type { AmbientParams } from '@/lib/audio/audio.types'
import type { ProjectMusic } from '@/types/ProjectTypes'

const MUTE_KEY = 'ambient-sound-muted'
const GESTURES = ['pointerdown', 'keydown', 'touchstart'] as const
const LOADER_COMPLETE_EVENT = 'site-loader-complete'

type AmbientEngineModule = typeof import('@/lib/audio/engine')
type AmbientEngineConstructor = AmbientEngineModule['AmbientEngine']

type Props = {
    children: ReactNode
}

const AudioProvider = ({ children }: Props) => {
    const engineRef = useRef<AmbientEngine | null>(null)
    const pendingParams = useRef<Partial<AmbientParams>>({})
    const engineImportRef = useRef<Promise<AmbientEngineModule> | null>(null)
    const engineConstructorRef = useRef<AmbientEngineConstructor | null>(null)
    const wantedRef = useRef(false)
    const pendingTrackRef = useRef<ProjectMusic | null>(null)
    const loaderCompleteRef = useRef(false)
    const [enabled, setEnabled] = useState(false)
    const [ready, setReady] = useState(false)
    const [currentTrackLabel, setCurrentTrackLabel] = useState<string | null>(null)

    const initialize = useCallback((): AmbientEngine | null => {
        if (engineRef.current) return engineRef.current

        const AmbientEngine = engineConstructorRef.current
        if (!AmbientEngine) return null

        const engine = new AmbientEngine()
        engineRef.current = engine
        if (Object.keys(pendingParams.current).length) engine.setParams(pendingParams.current)
        // Deep-link direct sur un projet avec musique : suspend la générative
        // avant même start(), pour qu'elle ne soit jamais audible avant que
        // playTrack() ne prenne le relais juste après.
        if (pendingTrackRef.current) {
            engine.suspendGenerative(0)
            void engine.playTrack(pendingTrackRef.current)
        }
        return engine
    }, [])

    const preload = useCallback(() => {
        if (!engineImportRef.current) {
            engineImportRef.current = import('@/lib/audio/engine').then((module) => {
                engineConstructorRef.current = module.AmbientEngine
                return module
            })
        }
        return engineImportRef.current
    }, [])

    const prepare = useCallback(async (): Promise<AmbientEngine> => {
        const existing = initialize()
        if (existing) return existing

        await preload()
        const engine = initialize()
        if (!engine) throw new Error('Le moteur audio ne peut pas être initialisé.')
        return engine
    }, [initialize, preload])

    const boot = useCallback(async () => {
        const engine = await prepare()
        if (!wantedRef.current || !loaderCompleteRef.current) return

        const started = await engine.start()
        if (!started || !wantedRef.current) {
            if (!wantedRef.current) engine.stop()
            return
        }

        if (pendingTrackRef.current) void engine.playTrack(pendingTrackRef.current)
        setReady(true)
        setEnabled(true)
    }, [prepare])

    const apply = useCallback(
        (next: boolean, fromGesture: boolean = false) => {
            wantedRef.current = next
            if (next) {
                const engine = initialize()
                if (fromGesture) engine?.unlock()
                void boot()
                return
            }

            setReady(false)
            setEnabled(false)
            engineRef.current?.stop()
        },
        [boot, initialize],
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
        apply(next, true)
    }, [apply])

    useEffect(() => {
        void preload()
    }, [preload])

    useEffect(() => {
        loaderCompleteRef.current =
            document.documentElement.classList.contains('loader-complete') ||
            document.documentElement.classList.contains('loader-seen')

        const onLoaderComplete = () => {
            loaderCompleteRef.current = true
            if (wantedRef.current) void boot()
        }

        window.addEventListener(LOADER_COMPLETE_EVENT, onLoaderComplete)
        return () => window.removeEventListener(LOADER_COMPLETE_EVENT, onLoaderComplete)
    }, [boot])

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

        const audioWindow = window as Window & { __portfolioAudioGestureSeen?: boolean }
        if (audioWindow.__portfolioAudioGestureSeen) {
            apply(true, true)
            return
        }

        const detach = () => GESTURES.forEach((type) => window.removeEventListener(type, onGesture))

        // Un geste né dans le toggle est laissé à son propre onClick, sinon le
        // pointerdown allumerait le son que le click éteindrait dans la foulée.
        const onGesture = (event: Event) => {
            detach()
            const target = event.target
            if (target instanceof Element && target.closest('.sound-toggle')) return
            apply(true, true)
        }

        GESTURES.forEach((type) => window.addEventListener(type, onGesture, { passive: true }))
        return detach
    }, [apply])

    useEffect(() => {
        return () => {
            engineRef.current?.dispose()
            engineRef.current = null
            engineImportRef.current = null
            engineConstructorRef.current = null
            wantedRef.current = false
        }
    }, [])

    // pendingTrackRef sert de boîte aux lettres : posée dès le montage de la page
    // projet (avant tout geste utilisateur), elle est relue par boot() une fois le
    // moteur prêt. Une fois le moteur existant, les appels ultérieurs l'atteignent
    // directement.
    const setTrack = useCallback((track: ProjectMusic | null) => {
        pendingTrackRef.current = track
        setCurrentTrackLabel(track?.label ?? null)

        const engine = engineRef.current
        if (!engine) return

        if (track) {
            engine.suspendGenerative()
            void engine.playTrack(track)
        } else {
            engine.stopTrack()
            engine.resumeGenerative()
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
            setTrack,
            currentTrackLabel,
        }),
        [enabled, ready, toggle, setTrack, currentTrackLabel],
    )

    return (
        <AmbientAudioContext.Provider value={value}>
            <SfxDelegate />
            {children}
        </AmbientAudioContext.Provider>
    )
}

export default AudioProvider
