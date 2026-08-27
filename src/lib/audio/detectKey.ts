// Détection de tonalité à l'upload d'un morceau, exécutée une seule fois côté
// client admin. On ne cherche que la tonique (une classe de hauteur parmi douze) :
// le mode majeur/mineur n'a pas d'incidence sur des SFX qui ne jouent que des notes
// isolées. Goertzel plutôt qu'une FFT complète, puisqu'on ne cherche que 60
// fréquences connues d'avance (12 classes de hauteur × 5 octaves).

import { SEMITONES_PER_OCTAVE } from './audio.config'
import { foldSemitones } from './audio.utils'
import {
    ANALYSIS_SAMPLE_RATE,
    FRAME_SIZE,
    MAJOR_PROFILE,
    MAX_ANALYSIS_SECONDS,
    MINOR_PROFILE,
    OCTAVES,
    PITCH_CLASSES,
    REFERENCE_A4_HZ,
    REFERENCE_A4_MIDI,
    ROOT_PITCH_CLASS_INDEX,
    SEGMENT_SPAN_RATIO,
    SEGMENT_START_RATIO,
} from './detectKey.config'

export interface DetectedKey {
    pitchClass: string
    rootOffset: number
}

// Nom de note affiché dans l'admin pour un rootOffset donné (demi-tons vs Ré2).
export const noteNameFromRootOffset = (rootOffset: number): string => {
    const index = (((rootOffset + ROOT_PITCH_CLASS_INDEX) % SEMITONES_PER_OCTAVE) + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE
    return PITCH_CLASSES[index]
}

const midiToHz = (midi: number): number => REFERENCE_A4_HZ * Math.pow(2, (midi - REFERENCE_A4_MIDI) / SEMITONES_PER_OCTAVE)

// Une fréquence par (classe de hauteur, octave) : C2..B6, 60 bins au total.
const chromaBins = (): { pitchClass: number; hz: number }[] => {
    const bins: { pitchClass: number; hz: number }[] = []
    OCTAVES.forEach((octave) => {
        for (let pitchClass = 0; pitchClass < SEMITONES_PER_OCTAVE; pitchClass++) {
            const midi = (octave + 1) * SEMITONES_PER_OCTAVE + pitchClass
            bins.push({ pitchClass, hz: midiToHz(midi) })
        }
    })
    return bins
}

const goertzelMagnitude = (frame: Float32Array, targetHz: number, sampleRate: number): number => {
    const k = Math.round((frame.length * targetHz) / sampleRate)
    const omega = (2 * Math.PI * k) / frame.length
    const coeff = 2 * Math.cos(omega)
    let s0 = 0
    let s1 = 0
    let s2 = 0
    for (let i = 0; i < frame.length; i++) {
        s0 = frame[i] + coeff * s1 - s2
        s2 = s1
        s1 = s0
    }
    const real = s1 - s2 * Math.cos(omega)
    const imag = s2 * Math.sin(omega)
    return Math.sqrt(real * real + imag * imag)
}

// Mixdown mono + décimation naïve : suffisant pour une estimation corrigible à la
// main, on ne cherche pas la précision d'un vrai pitch tracker.
const downsampleMono = (decoded: AudioBuffer, startSample: number, length: number, targetRate: number): Float32Array => {
    const channels = decoded.numberOfChannels
    const mono = new Float32Array(length)
    for (let channel = 0; channel < channels; channel++) {
        const data = decoded.getChannelData(channel)
        for (let i = 0; i < length; i++) mono[i] += data[startSample + i] / channels
    }

    const ratio = decoded.sampleRate / targetRate
    const targetLength = Math.floor(length / ratio)
    const decimated = new Float32Array(targetLength)
    for (let i = 0; i < targetLength; i++) decimated[i] = mono[Math.floor(i * ratio)]
    return decimated
}

const correlate = (chroma: number[], profile: number[], tonic: number): number => {
    const rotated = profile.map((_, i) => profile[(i - tonic + SEMITONES_PER_OCTAVE) % SEMITONES_PER_OCTAVE])
    const meanChroma = chroma.reduce((a, b) => a + b, 0) / chroma.length
    const meanProfile = rotated.reduce((a, b) => a + b, 0) / rotated.length

    let numerator = 0
    let chromaVariance = 0
    let profileVariance = 0
    for (let i = 0; i < chroma.length; i++) {
        const dc = chroma[i] - meanChroma
        const dp = rotated[i] - meanProfile
        numerator += dc * dp
        chromaVariance += dc * dc
        profileVariance += dp * dp
    }

    const denominator = Math.sqrt(chromaVariance * profileVariance)
    return denominator > 0 ? numerator / denominator : 0
}

// Offset en demi-tons vs BASE_HZ (Ré2), ramené dans [-6, 5].
const rootOffsetFromPitchClass = (pitchClass: number): number => foldSemitones(pitchClass - ROOT_PITCH_CLASS_INDEX)

export const detectKey = async (file: File): Promise<DetectedKey | null> => {
    if (typeof window === 'undefined') return null

    const Ctor =
        window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctor()

    try {
        const arrayBuffer = await file.arrayBuffer()
        const decoded = await ctx.decodeAudioData(arrayBuffer)

        // Segment central : évite l'intro et l'outro, souvent peu représentatives
        // de l'harmonie du morceau.
        const spanSeconds = Math.min(decoded.duration * SEGMENT_SPAN_RATIO, MAX_ANALYSIS_SECONDS)
        const startSample = Math.floor(decoded.duration * SEGMENT_START_RATIO * decoded.sampleRate)
        const spanLength = Math.floor(spanSeconds * decoded.sampleRate)
        if (spanLength <= 0 || startSample + spanLength > decoded.length) return null

        const mono = downsampleMono(decoded, startSample, spanLength, ANALYSIS_SAMPLE_RATE)
        const bins = chromaBins()
        const chroma = new Array<number>(SEMITONES_PER_OCTAVE).fill(0)

        for (let offset = 0; offset + FRAME_SIZE <= mono.length; offset += FRAME_SIZE) {
            const frame = mono.subarray(offset, offset + FRAME_SIZE)
            let frameEnergy = 0
            for (let i = 0; i < frame.length; i++) frameEnergy += frame[i] * frame[i]
            if (frameEnergy <= 0) continue

            const normaliser = Math.sqrt(frameEnergy)
            bins.forEach(({ pitchClass, hz }) => {
                // Normalisé par l'énergie de la frame : un passage fort ne doit pas
                // dominer le chromagramme au détriment des passages calmes.
                chroma[pitchClass] += goertzelMagnitude(frame, hz, ANALYSIS_SAMPLE_RATE) / normaliser
            })
        }

        if (chroma.every((value) => value === 0)) return null

        let best = { score: -Infinity, pitchClass: 0 }
        for (let tonic = 0; tonic < SEMITONES_PER_OCTAVE; tonic++) {
            const score = Math.max(correlate(chroma, MAJOR_PROFILE, tonic), correlate(chroma, MINOR_PROFILE, tonic))
            if (score > best.score) best = { score, pitchClass: tonic }
        }

        return {
            pitchClass: PITCH_CLASSES[best.pitchClass],
            rootOffset: rootOffsetFromPitchClass(best.pitchClass),
        }
    } catch {
        return null
    } finally {
        void ctx.close()
    }
}
