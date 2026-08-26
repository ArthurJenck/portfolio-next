export const BASE_HZ = 146.83

export const SCALE = [0, 2, 6, 7, 9, 11]

export const DRONE_DEGREES = [0, 7, 12]

export const ROOT_STEPS = SCALE.filter((step) => DRONE_DEGREES.every((degree) => SCALE.includes((step + degree) % 12)))

export const VOICE_CLASSES = SCALE.filter((degree) => degree !== 0)

export type Prng = () => number

export const createPrng = (seed: number): Prng => {
    let state = seed >>> 0
    return () => {
        state = (state + 0x6d2b79f5) >>> 0
        let t = state
        t = Math.imul(t ^ (t >>> 15), t | 1)
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
}

export const createSeed = (): number => Math.floor(Math.random() * 4294967296)

export const semitoneRatio = (semitones: number): number => Math.pow(2, semitones / 12)

export const pitchClassDistance = (a: number, b: number): number => {
    const raw = Math.abs(a - b) % 12
    return Math.min(raw, 12 - raw)
}
