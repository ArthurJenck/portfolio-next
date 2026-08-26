export type AmbientParams = {
    depth: number
    activity: number
}

export const DEFAULT_PARAMS: AmbientParams = {
    depth: 0,
    activity: 0,
}

export const clamp01 = (value: number): number => Math.max(0, Math.min(1, value))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

export const MIX = {
    master: 0.18,
    fadeIn: 3,
    fadeOut: 1.8,
    paramRamp: 3.5,
}

export const REVERB = {
    seconds: 4.5,
    predelayMs: 22,
    colour: 0.37,
}

export const DRONE = {
    detuneCents: 5,
    filterQ: 1.3,
    cutoffLow: 200,
    cutoffHigh: 900,
    breatheHz: 0.021,
    breatheAmount: 70,
    modulationSeconds: 25,
    modulationFadeIn: 5,
    modulationFadeOut: 2,
}

export const VOICES = {
    max: 3,
    minGapSemitones: 3,
    intervalLow: 15,
    intervalHigh: 7,
    lowpassLow: 650,
    lowpassHigh: 1800,
}

export const PIANO = {
    amount: 0.45,
    intervalIdle: 40,
    intervalDense: 2.5,
    inharmonicity: 0.0005,
    partials: 6,
    partialCeiling: 3600,
    lowpassLow: 900,
    lowpassHigh: 1600,
}

export const METALLIC = {
    density: 0.05,
    ratio: 2.76,
    level: 0.5,
    intervalIdle: 26,
    intervalDense: 6,
    lowpassLow: 1400,
    lowpassHigh: 2400,
}

export const WIND = {
    maxSpeed: 2200,
    level: 0.4,
    bandBase: 400,
    bandRise: 700,
    cap: 1700,
    attack: 0.03,
    release: 0.13,
    reverbSend: 0.3,
    transientLevel: 0.22,
    transientMinIntervalMs: 160,
    onsetThreshold: 0.12,
}

export const OUTPUT = {
    rumbleHz: 62,
    tameHz: 3200,
    tameGain: -9,
    brillanceCeiling: 3528,
}

export const IRREGULARITY = 0.85

export const IDLE = {
    afterSeconds: 25,
    floor: 0.25,
    rampSeconds: 8,
}

export const intimacyFromDepth = (depth: number): number => clamp01(depth * 0.45)

export type SfxName = 'tick' | 'tileHover' | 'press' | 'release' | 'navInternal' | 'navExternal' | 'like'

export type SfxOptions = {
    pan?: number
    gain?: number
    still?: boolean
}

// level compense le trim de MIX.master, calibré pour une nappe continue : sans lui
// les SFX sortent sous le drone. guardThreshold est assez haut pour que le guard ne
// rattrape que les rafales au lieu d'écraser chaque son isolé.
export const SFX_BUS = {
    level: 3,
    wet: 0.9,
    reverbSeconds: 1.6,
    reverbPredelayMs: 12,
    reverbColour: 0.5,
    guardThreshold: -14,
    guardKnee: 6,
    guardRatio: 4,
    guardAttack: 0.004,
    guardRelease: 0.18,
}

export const SFX_GATE = {
    latencyGateMs: 120,
    minGapMs: 25,
    hoverCooldownMs: 60,
    burstWindowMs: 400,
    burstDecay: 0.72,
    burstFloor: 0.35,
    tickCooldownMs: 45,
    tileCooldownMs: 90,
    buttonCooldownMs: 30,
    navCooldownMs: 140,
    // Aligné sur les boutons : au-dessus, un clic humain rapide (60-90 ms) se fait
    // rejeter une fois sur deux et le bouton paraît cassé par intermittence.
    likeCooldownMs: 35,
}

// La variance doit s'entendre comme « vivant », jamais comme une autre note : deux
// déclenchements séparés par plus d'une dizaine de cents sonnent comme un désaccord.
export const SFX_VARIANCE = {
    time: 0.1,
    colour: 0.14,
    level: 0.1,
    pan: 0.12,
}

// L'écart de hauteur est réglé par son : 45 cents sur un tick de 75 ms passent
// inaperçus, les mêmes 45 cents sur un accord tenu battent contre le drone.
export const SFX_TICK = {
    variance: 0.4,
    varianceCents: 12,
    gain: 0.13,
    attack: 0.004,
    seconds: 0.075,
    degree: 9,
    octave: 1,
    secondDegree: 2,
    secondOctave: 3,
    secondGain: 0.32,
    chiffMs: 8,
    chiffGain: 0.12,
    chiffQ: 1.1,
    lowpassRatio: 1.6,
    lowpassQ: 0.7,
    buttonGain: 0.7,
    send: 0.06,
}

export const SFX_TILE = {
    variance: 0.35,
    varianceCents: 7,
    gain: 0.2,
    attack: 0.09,
    seconds: 0.5,
    degree: 0,
    octave: 1,
    send: 0.3,
    openFrom: 1.1,
    openTo: 5.5,
    openSeconds: 0.34,
    openQ: 0.8,
    spreadCents: 4,
    spreadTo: 26,
}

export const SFX_PRESS = {
    variance: 0.35,
    varianceCents: 14,
    gain: 0.16,
    attack: 0.001,
    seconds: 0.045,
    degree: 7,
    octave: 1,
    dropOctaves: 1.6,
    dropSeconds: 0.014,
    bodyGain: 0.55,
    bodySeconds: 0.05,
    twinDegree: 7,
    twinGain: 0.4,
    twinDrop: 0.8,
    twinSeconds: 0.03,
    send: 0.04,
}

export const SFX_RELEASE = {
    variance: 0.35,
    varianceCents: 14,
    gain: 0.13,
    attack: 0.001,
    seconds: 0.026,
    degree: 7,
    octave: 2,
    clickMs: 4,
    clickColour: 0.72,
    clickGain: 1,
    clickQ: 7,
    clickRatio: 4.4,
    dropOctaves: 0.9,
    dropSeconds: 0.008,
    bodyGain: 0.32,
    bodySeconds: 0.028,
    send: 0.02,
}

export const SFX_NAV = {
    variance: 0.3,
    varianceCents: 3,
    gain: 0.12,
    attack: 0.03,
    seconds: 0.7,
    degree: 0,
    octave: 1,
    send: 0.34,
    voiceB: 7,
    voiceC: 12,
    spread: 0.012,
    openFrom: 1.2,
    openTo: 4.6,
    openPeak: 0.22,
    closeTo: 1.4,
    openQ: 0.9,
    tailGain: 0.5,
    panSpread: 0.2,
}

export const SFX_EXT = {
    variance: 0.3,
    varianceCents: 3,
    gain: 0.12,
    attack: 0.04,
    seconds: 1.1,
    degree: 0,
    octave: 1,
    send: 0.72,
    voiceB: 7,
    voiceC: 12,
    spread: 0.02,
    openFrom: 1.2,
    openTo: 5.4,
    openPeak: 0.4,
    closeTo: 3.2,
    openQ: 0.9,
    tailGain: 1,
    panSpread: 0.4,
}

// Le seul son de récompense du site. Le « ting » vient des partiels INHARMONIQUES
// (2,76 et 5,42 : les modes d'une barre libre, comme un glockenspiel) et de leur
// extinction plus rapide que la fondamentale — l'aigu claque puis laisse résonner.
// Un lowpass serré les tuerait : d'où un plafond propre, plus haut que SFX_CEILING.
export const SFX_LIKE = {
    variance: 0.25,
    varianceCents: 6,
    gain: 0.34,
    attack: 0.0015,
    // Registre choisi pour que les trois partiels restent sous le plafond sur les
    // quatre racines : plus haut, le mode 5,42 disparaissait selon la tonalité et le
    // son changeait de caractère. La brillance vient des partiels, pas de la fondamentale.
    degree: 7,
    octave: 1,
    interval: 5,
    gapSeconds: 0.075,
    firstSeconds: 0.16,
    secondSeconds: 0.5,
    partialA: 2.76,
    partialB: 5.42,
    partialAGain: 0.6,
    partialBGain: 0.3,
    partialDecay: 0.45,
    ceiling: 7000,
    send: 0.3,
}

export const SFX_CEILING = 3000
