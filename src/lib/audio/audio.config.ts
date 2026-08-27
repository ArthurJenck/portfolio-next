// Constantes pures de l'ambiance sonore générative. Aucune fonction ici : tout ce
// qui calcule vit dans audio.utils.ts, les types dans audio.types.ts. Ce fichier
// est le plan de tuning du sound design, réglé à l'oreille.

import type { AmbientParams } from './audio.types'

export const DEFAULT_PARAMS: AmbientParams = {
    depth: 0,
    activity: 0,
}

export const BASE_HZ = 146.83

export const SCALE = [0, 2, 6, 7, 9, 11]

export const DRONE_DEGREES = [0, 7, 12]

export const ROOT_STEPS = SCALE.filter((step) => DRONE_DEGREES.every((degree) => SCALE.includes((step + degree) % 12)))

export const VOICE_CLASSES = SCALE.filter((degree) => degree !== 0)

export const SEMITONES_PER_OCTAVE = 12

// Coefficient reliant depth à l'intimité du mix (voir intimacyFromDepth).
export const INTIMACY_DEPTH_GAIN = 0.45

// Constante de décorrélation du PRNG des SFX vis-à-vis de celui de la composition
// (ratio doré × 2^32, cf. boost::hash_combine) : sans elle, partager la graine
// ferait dépendre la musique générative des mouvements de souris du visiteur.
export const SFX_SEED_XOR = 0x9e3779b9

// Gain plancher des rampes exponentielles Web Audio, qui n'acceptent jamais une
// cible à zéro strict.
export const SILENCE_GAIN = 0.0001

// Niveau plancher pour qu'une rampe exponentielle parte d'un point audible non nul.
export const MIN_AUDIBLE_GAIN = 0.0002

// Marge de sécurité ajoutée à la durée d'une enveloppe SFX générique.
export const ENVELOPE_TAIL_SECONDS = 0.01

// Marge avant l'arrêt de l'oscillateur d'impact d'un clic (sfxBody).
export const CLICK_STOP_BUFFER_SECONDS = 0.05

// Plancher de fréquence des filtres lowpass ouverts par tileHover/nav : en dessous,
// le son perd tout corps avant même l'ouverture du filtre.
export const LOWPASS_FLOOR_HZ = 60

// Normalise une distance de scroll (px) en intensité 0-1 pour le transitoire de vent.
export const SCROLL_NORMALIZE_PX = 60

// Durée de frame par défaut avant la première mesure réelle (~1/60s).
export const FALLBACK_FRAME_SECONDS = 0.016

// Plafond de dt entre deux frames : au-delà (onglet suspendu, etc.), on tronque
// pour éviter un saut brutal de l'énergie de vent.
export const MAX_FRAME_SECONDS = 0.1

// Normalise un pourcentage de variance (0-100) en fraction.
export const CENT_SCALE = 100

// Marge ajoutée après le fondu de sortie avant de fermer l'AudioContext.
export const DISPOSE_BUFFER_MS = 300

export const MIX = {
    master: 0.18,
    fadeIn: 3,
    fadeOut: 1.8,
    paramRamp: 3.5,
    // Rampe utilisée quand applyParams doit réagir immédiatement (état initial).
    immediateRampSeconds: 0.05,
    // Mix dry/wet aux deux bornes d'intimité (depth haut = intime = plus dry).
    wetIntimacyHigh: 0.85,
    wetIntimacyLow: 0.18,
    dryIntimacyLow: 0.5,
}

export const MUSIC = {
    // Fondu exponentiel entre l'ambiance générative et la musique d'un projet, dans
    // les deux sens.
    crossfadeSeconds: 0.6,
    defaultVolume: 0.5,
    // Marge après le fondu de coupure avant de mettre l'élément <audio> en pause.
    pauseBufferMs: 50,
}

export const REVERB = {
    seconds: 4.5,
    predelayMs: 22,
    colour: 0.37,
    // Exposant de la courbe de décroissance de l'impulse response (plus haut = chute plus abrupte).
    decayExponent: 2.4,
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
    // Plancher de délai (ms) avant la prochaine modulation, même si le jitter tombe bas.
    modulationFloorMs: 8000,
    // Jitter de détune entre les deux oscillateurs d'une même voix de drone.
    detuneJitterBase: 0.7,
    detuneJitterRange: 0.6,
    // Répartition du gain entre les degrés du drone (plus haut = plus discret).
    voiceGainBase: 0.13,
    voiceGainFalloff: 0.13,
    // Marge avant l'arrêt des oscillateurs d'une pile de drone qui s'éteint.
    stopBufferSeconds: 0.2,
}

export const VOICES = {
    max: 3,
    minGapSemitones: 3,
    intervalLow: 15,
    intervalHigh: 7,
    lowpassLow: 650,
    lowpassHigh: 1800,
    // Plancher de délai (ms) avant la prochaine voix.
    scheduleFloorMs: 1800,
    // Réduction du pool de hauteurs disponibles à mesure que depth augmente.
    poolShrink: 0.5,
    // Candidats d'octave pour une nouvelle voix : biaisés 3/4 vers l'octave simple.
    octaveCandidates: [SEMITONES_PER_OCTAVE, SEMITONES_PER_OCTAVE, SEMITONES_PER_OCTAVE, SEMITONES_PER_OCTAVE * 2],
    upperOctaveSemitone: SEMITONES_PER_OCTAVE * 2,
    detuneRange: 14,
    detuneCenter: 7,
    modulatorRatio: 1.487,
    modulationDepthBase: 0.004,
    modulationDepthRange: 0.01,
    lowpassQ: 0.9,
    panRange: 1.2,
    panCenter: 0.6,
    attackBase: 4,
    attackRange: 7,
    holdBase: 3,
    holdRange: 6,
    releaseBase: 6,
    releaseRange: 8,
    peakBase: 0.05,
    peakRange: 0.05,
    peakIntimacyMix: 0.25,
    // Atténuation appliquée aux voix déclenchées deux octaves au-dessus de la fondamentale.
    upperOctaveAttenuation: 0.5,
    stopBufferSeconds: 0.2,
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
    // Plancher de délai (ms) avant la prochaine note.
    scheduleFloorMs: 1200,
    lowpassQ: 0.7,
    panRange: 0.9,
    panCenter: 0.45,
    peakBase: 0.05,
    peakRange: 0.045,
    // Probabilité et facteur de doublement d'octave de la fondamentale.
    octaveUpProbability: 0.4,
    octaveUpFactor: 2,
    // Roll-off d'amplitude des partiels (peak / n^rolloff).
    partialRolloff: 1.5,
    partialDetuneRange: 8,
    partialDetuneCenter: 4,
    decayBase: 5,
    decayRange: 4,
    decaySharpness: 0.55,
    attackSeconds: 0.012,
    stopBufferSeconds: 0.1,
    // Bruit de marteau : durée, forme, filtre et niveau.
    hammerSeconds: 0.04,
    hammerShapeExponent: 3,
    hammerBandRatio: 2.2,
    hammerBandCeiling: 2000,
    hammerBandQ: 0.8,
    hammerGainRatio: 0.16,
    // Probabilité et délai d'une seconde note déclenchée par la même frappe.
    retriggerProbability: 0.32,
    retriggerDelayBase: 0.5,
    retriggerDelayRange: 1.2,
}

export const METALLIC = {
    density: 0.05,
    ratio: 2.76,
    level: 0.5,
    intervalIdle: 26,
    intervalDense: 6,
    lowpassLow: 1400,
    lowpassHigh: 2400,
    // Plancher de délai (ms) avant le prochain son métallique.
    scheduleFloorMs: 2000,
    // Facteurs harmoniques choisis pour la fréquence porteuse (probabilité 50/50).
    harmonicChoiceProbability: 0.5,
    harmonicLow: 2,
    harmonicHigh: 3,
    modulationDepthBase: 0.22,
    modulationDepthRange: 0.58,
    lowpassQ: 0.6,
    panRange: 1.7,
    panCenter: 0.85,
    attackBase: 0.35,
    attackRange: 1.05,
    decayBase: 3.5,
    decayRange: 5.5,
    peakBase: 0.012,
    peakRange: 0.026,
    // Plancher de mix de densité en fonction de l'activité/depth.
    densityActivityFloor: 0.25,
    densityDepthFloor: 0.5,
    activityMixFloor: 0.4,
    stopBufferSeconds: 0.2,
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
    // Bruit continu : durée de la boucle, lissage, résonance du filtre de bande et du cap.
    noiseSeconds: 4,
    noiseSmoothing: 0.55,
    bandQ: 1.3,
    capQ: 0.5,
    sweepHz: 0.037,
    sweepAmountHz: 200,
    // Lissage exponentiel de l'énergie de vent (attaque rapide / relâchement lent).
    attackTau: 0.02,
    energyFloor: 0.001,
    targetEpsilon: 0.004,
    releaseSmoothing: 0.05,
    // Seuil d'intensité au-dessus duquel un transitoire de scroll déclenche un souffle.
    transientOnsetIntensity: 0.07,
    // Transitoire de scroll : bruit, filtre, panoramique et enveloppe.
    transientSmoothing: 0.75,
    transientShapeExponent: 2.5,
    transientBandBase: 700,
    transientBandRange: 600,
    transientPanRange: 0.6,
    transientPanCenter: 0.3,
    transientAttackSeconds: 0.003,
    transientStopBufferSeconds: 0.05,
}

export const OUTPUT = {
    rumbleHz: 62,
    tameHz: 3200,
    tameGain: -9,
    brillanceCeiling: 3528,
}

export const IRREGULARITY = 0.85

// Gain appliqué à l'irrégularité pour étaler le spread du jitter temporel.
export const JITTER_SPREAD_GAIN = 1.6

export const IDLE = {
    afterSeconds: 25,
    floor: 0.25,
    rampSeconds: 8,
    // Écart minimal avant de considérer que la cible d'idle a changé.
    targetEpsilon: 0.01,
}

// Délais de démarrage du moteur : première voix, puis un SFX inaudible pour
// absorber la compilation JIT et le premier rendu du convolver.
export const STARTUP = {
    firstVoiceDelayMs: 2500,
    primingDelayMs: 400,
    primingGain: 0.001,
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
    chiffColour: 0.8,
    chiffShape: 3,
    chiffBandRatio: 1.5,
    lowpassRatio: 1.6,
    lowpassQ: 0.7,
    buttonGain: 0.7,
    send: 0.06,
    stopBufferSeconds: 0.1,
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
    stopBufferSeconds: 0.15,
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
    clickShape: 2.2,
    clickMinSeconds: 0.008,
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

// Constantes de l'algorithme de sfxNav, partagées par SFX_NAV et SFX_EXT : elles
// décrivent le comportement de la fonction, pas la forme d'un son en particulier.
export const SFX_NAV_SHAPE = {
    voiceDetuneScale: 0.5,
    voiceGainFalloff: 0.6,
    stopBufferSeconds: 0.2,
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
    stopBufferSeconds: 0.1,
}

export const SFX_CEILING = 3000
