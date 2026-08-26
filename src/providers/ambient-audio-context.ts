'use client'

import { createContext, useContext } from 'react'
import type { AmbientEngine } from '@/lib/audio/engine'
import type { AmbientParams, SfxName, SfxOptions } from '@/lib/audio/params'

export type AmbientAudioValue = {
    enabled: boolean
    ready: boolean
    toggle: () => void
    getAnalyser: () => AnalyserNode | null
    getOutputLatencyMs: () => number
    setParams: (next: Partial<AmbientParams>) => void
    pushScroll: (pixels: number) => void
    markActivity: () => void
    triggerModulation: () => void
    playSfx: (name: SfxName, options?: SfxOptions) => void
    engineRef: () => AmbientEngine | null
}

export const AmbientAudioContext = createContext<AmbientAudioValue | null>(null)

export const useAmbientAudio = (): AmbientAudioValue => {
    const value = useContext(AmbientAudioContext)
    if (!value) throw new Error('useAmbientAudio doit être utilisé à l’intérieur de AudioProvider')
    return value
}
