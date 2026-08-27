import { INTIMACY_DEPTH_GAIN, SEMITONES_PER_OCTAVE } from './audio.config'
import type { Prng } from './audio.types'

export const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const intimacyFromDepth = (depth: number): number => clamp01(depth * INTIMACY_DEPTH_GAIN)

const MS_PER_SECOND = 1000

export const msToSeconds = (ms: number): number => ms / MS_PER_SECOND

export const secondsToMs = (seconds: number): number => seconds * MS_PER_SECOND

export const semitoneRatio = (semitones: number): number => Math.pow(2, semitones / SEMITONES_PER_OCTAVE)

export const pitchClassDistance = (a: number, b: number): number => {
    const raw = Math.abs(a - b) % SEMITONES_PER_OCTAVE
    return Math.min(raw, SEMITONES_PER_OCTAVE - raw)
}

// Constantes de l'algorithme mulberry32 (Tommy Ettinger) : fixes, non réglables.
const MULBERRY32_INCREMENT = 0x6d2b79f5
const MULBERRY32_SHIFT_A = 15
const MULBERRY32_SHIFT_B = 7
const MULBERRY32_MIX_CONSTANT = 61
const MULBERRY32_SHIFT_C = 14
const UINT32_RANGE = 4294967296

export const createPrng = (seed: number): Prng => {
    let state = seed >>> 0
    return () => {
        state = (state + MULBERRY32_INCREMENT) >>> 0
        let t = state
        t = Math.imul(t ^ (t >>> MULBERRY32_SHIFT_A), t | 1)
        t ^= t + Math.imul(t ^ (t >>> MULBERRY32_SHIFT_B), t | MULBERRY32_MIX_CONSTANT)
        return ((t ^ (t >>> MULBERRY32_SHIFT_C)) >>> 0) / UINT32_RANGE
    }
}

export const createSeed = (): number => Math.floor(Math.random() * UINT32_RANGE)
