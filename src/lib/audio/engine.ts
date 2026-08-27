import {
    BASE_HZ,
    CENT_SCALE,
    CLICK_STOP_BUFFER_SECONDS,
    DEFAULT_PARAMS,
    DISPOSE_BUFFER_MS,
    DRONE,
    DRONE_DEGREES,
    ENVELOPE_TAIL_SECONDS,
    FALLBACK_FRAME_SECONDS,
    IDLE,
    IRREGULARITY,
    JITTER_SPREAD_GAIN,
    LOWPASS_FLOOR_HZ,
    MAX_FRAME_SECONDS,
    METALLIC,
    MIN_AUDIBLE_GAIN,
    MIX,
    MUSIC,
    OUTPUT,
    PIANO,
    REVERB,
    ROOT_STEPS,
    SCROLL_NORMALIZE_PX,
    SEMITONES_PER_OCTAVE,
    SFX_BUS,
    SFX_CEILING,
    SFX_EXT,
    SFX_GATE,
    SFX_LIKE,
    SFX_NAV,
    SFX_NAV_SHAPE,
    SFX_PRESS,
    SFX_RELEASE,
    SFX_SEED_XOR,
    SFX_TICK,
    SFX_TILE,
    SFX_VARIANCE,
    SILENCE_GAIN,
    STARTUP,
    VOICES,
    VOICE_CLASSES,
    WIND,
} from './audio.config'
import {
    clamp01,
    createPrng,
    createSeed,
    foldSemitones,
    intimacyFromDepth,
    lerp,
    msToSeconds,
    pitchClassDistance,
    secondsToMs,
    semitoneRatio,
} from './audio.utils'
import type { AmbientParams, Prng, SfxName, SfxOptions } from './audio.types'

type DroneStack = {
    gain: GainNode
    oscillators: OscillatorNode[]
}

type ActiveVoice = {
    semitone: number
    until: number
}

type SfxShape = {
    variance: number
    varianceCents: number
    gain: number
    attack: number
    seconds: number
    degree: number
    octave: number
    send: number
}

type ClickShape = SfxShape & {
    dropOctaves: number
    dropSeconds: number
    bodyGain: number
    bodySeconds: number
}

type NavShape = SfxShape & {
    voiceB: number
    voiceC: number
    spread: number
    openFrom: number
    openTo: number
    openPeak: number
    closeTo: number
    openQ: number
    tailGain: number
    panSpread: number
}

const fadeCurve = (rising: boolean, points = 64): Float32Array => {
    const curve = new Float32Array(points)
    for (let i = 0; i < points; i++) {
        const t = (i / (points - 1)) * (Math.PI / 2)
        curve[i] = rising ? Math.sin(t) : Math.cos(t)
    }
    return curve
}

export class AmbientEngine {
    private ctx: AudioContext
    private random: Prng

    private fade: GainNode
    private master: GainNode
    private analyser: AnalyserNode
    private dry: GainNode
    private wet: GainNode
    private convolver: ConvolverNode
    private bus: GainNode
    private brillance: BiquadFilterNode
    private compressor: DynamicsCompressorNode
    // Un seul point de coupure pour tout le contenu génératif (drone + events + vent,
    // dry et queue de reverb) : dry et wet y convergent tous les deux avant preMix, donc
    // un unique fondu ici les éteint ensemble sans toucher aux SFX ni à une piste projet.
    private generativeMute: GainNode

    private droneFilter: BiquadFilterNode
    private droneStack: DroneStack | null = null
    private rootOffset = 0
    private eventBus: GainNode

    private windGain: GainNode
    private windBand: BiquadFilterNode
    private windBus: GainNode

    private preMix: GainNode
    private sfxBus: GainNode
    private sfxGuard: DynamicsCompressorNode
    private sfxVerb: ConvolverNode
    private sfxWet: GainNode
    private sfxRandom: Prng
    private sfxLast = new Map<SfxName, number>()
    private sfxBurst = new Map<SfxName, number>()
    private sfxLastAny = 0

    // Piste projet : lue en parallèle du moteur génératif, sur son propre fondu
    // (trackFade), routée après l'EQ de sortie taillée pour le drone (cf. constructeur).
    private trackAudio: HTMLAudioElement | null = null
    private trackSource: MediaElementAudioSourceNode | null = null
    private trackGain: GainNode
    private trackFade: GainNode
    private currentTrackUrl: string | null = null
    private trackStopTimer = 0
    private generativeSuspended = false

    private params: AmbientParams = { ...DEFAULT_PARAMS }
    private timers: number[] = []
    private activeVoices: ActiveVoice[] = []

    private pxAccum = 0
    private windEnergy = 0
    private lastWindTarget = 0
    private lastTransient = 0
    private lastActivity = 0
    private lastIdleTarget = 1
    private frame = 0
    private lastFrameTime = 0

    private running = false
    private disposed = false

    constructor(seed: number = createSeed()) {
        const Ctor =
            window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
        this.ctx = new Ctor({ latencyHint: 'interactive' })
        this.random = createPrng(seed)
        this.rootOffset = ROOT_STEPS[Math.floor(this.random() * ROOT_STEPS.length)]

        const ctx = this.ctx

        this.fade = ctx.createGain()
        this.fade.gain.value = 0

        this.master = ctx.createGain()
        this.master.gain.value = MIX.master

        this.analyser = ctx.createAnalyser()
        this.analyser.fftSize = 1024
        this.analyser.smoothingTimeConstant = 0

        const rumble = ctx.createBiquadFilter()
        rumble.type = 'highpass'
        rumble.frequency.value = OUTPUT.rumbleHz

        const tame = ctx.createBiquadFilter()
        tame.type = 'highshelf'
        tame.frequency.value = OUTPUT.tameHz
        tame.gain.value = OUTPUT.tameGain

        this.brillance = ctx.createBiquadFilter()
        this.brillance.type = 'lowpass'
        this.brillance.frequency.value = OUTPUT.brillanceCeiling
        this.brillance.Q.value = 0.4

        this.compressor = ctx.createDynamicsCompressor()
        this.compressor.threshold.value = -26
        this.compressor.knee.value = 28
        this.compressor.ratio.value = 3
        this.compressor.attack.value = 0.05
        this.compressor.release.value = 0.5

        const limiter = ctx.createDynamicsCompressor()
        limiter.threshold.value = -3
        limiter.knee.value = 0
        limiter.ratio.value = 20
        limiter.attack.value = 0.002
        limiter.release.value = 0.12

        this.preMix = ctx.createGain()
        this.preMix.connect(this.fade)
        this.fade.connect(this.analyser)
        this.fade.connect(this.master)
        this.master.connect(rumble)
        rumble.connect(tame)
        tame.connect(this.brillance)
        this.brillance.connect(this.compressor)
        this.compressor.connect(limiter)
        limiter.connect(ctx.destination)

        this.dry = ctx.createGain()
        this.wet = ctx.createGain()
        this.convolver = ctx.createConvolver()
        this.convolver.buffer = this.createImpulse()
        this.generativeMute = ctx.createGain()
        this.dry.connect(this.generativeMute)
        this.convolver.connect(this.wet)
        this.wet.connect(this.generativeMute)
        this.generativeMute.connect(this.preMix)

        // Piste projet : bypasse l'EQ this.master → rumble/tame/brillance (taillée pour
        // le drone, elle étoufferait un morceau masterisé), mais garde le glue/limiteur
        // via this.compressor. Le tap vers l'analyser est parallèle, sans sortie propre :
        // sans lui le visualizer resterait plat pendant toute la lecture.
        this.trackGain = ctx.createGain()
        this.trackGain.gain.value = MUSIC.defaultVolume
        this.trackFade = ctx.createGain()
        this.trackFade.gain.value = 0
        this.trackGain.connect(this.trackFade)
        this.trackFade.connect(this.compressor)
        this.trackFade.connect(this.analyser)

        this.bus = ctx.createGain()
        this.bus.connect(this.dry)
        this.bus.connect(this.convolver)

        this.eventBus = ctx.createGain()
        this.eventBus.connect(this.bus)

        this.droneFilter = ctx.createBiquadFilter()
        this.droneFilter.type = 'lowpass'
        this.droneFilter.frequency.value = DRONE.cutoffLow
        this.droneFilter.Q.value = DRONE.filterQ
        this.droneFilter.connect(this.bus)

        const breathe = ctx.createOscillator()
        breathe.frequency.value = DRONE.breatheHz
        const breatheAmount = ctx.createGain()
        breatheAmount.gain.value = DRONE.breatheAmount
        breathe.connect(breatheAmount)
        breatheAmount.connect(this.droneFilter.frequency)
        breathe.start()

        this.windBus = ctx.createGain()
        this.windBus.connect(this.dry)
        const windSend = ctx.createGain()
        windSend.gain.value = WIND.reverbSend
        this.windBus.connect(windSend)
        windSend.connect(this.convolver)

        // Les SFX rejoignent la chaîne à preMix : ils héritent du fondu, de l'analyseur
        // et de l'EQ de sortie, mais échappent au mix dry/wet piloté par depth et au
        // duck d'inactivité de eventBus, qui les atténuerait de 12 dB après une pause.
        this.sfxVerb = ctx.createConvolver()
        this.sfxVerb.buffer = this.createImpulse(SFX_BUS.reverbSeconds, SFX_BUS.reverbPredelayMs, SFX_BUS.reverbColour)
        this.sfxWet = ctx.createGain()
        this.sfxWet.gain.value = SFX_BUS.wet
        this.sfxVerb.connect(this.sfxWet)
        this.sfxWet.connect(this.preMix)

        this.sfxGuard = ctx.createDynamicsCompressor()
        this.sfxGuard.threshold.value = SFX_BUS.guardThreshold
        this.sfxGuard.knee.value = SFX_BUS.guardKnee
        this.sfxGuard.ratio.value = SFX_BUS.guardRatio
        this.sfxGuard.attack.value = SFX_BUS.guardAttack
        this.sfxGuard.release.value = SFX_BUS.guardRelease

        this.sfxBus = ctx.createGain()
        this.sfxBus.gain.value = SFX_BUS.level
        this.sfxGuard.connect(this.sfxBus)
        this.sfxBus.connect(this.preMix)

        // Un PRNG distinct : partager celui de la composition ferait dépendre la
        // musique générative des mouvements de souris du visiteur.
        this.sfxRandom = createPrng((seed ^ SFX_SEED_XOR) >>> 0)

        const { gain, band } = this.createWind()
        this.windGain = gain
        this.windBand = band

        this.droneStack = this.createDroneStack(0)
        this.applyParams(true)
    }

    get audioContext(): AudioContext {
        return this.ctx
    }

    getAnalyser(): AnalyserNode {
        return this.analyser
    }

    getOutputLatencyMs(): number {
        return secondsToMs(this.ctx.outputLatency || 0)
    }

    private currentRootHz(): number {
        return BASE_HZ * semitoneRatio(this.rootOffset)
    }

    private createImpulse(
        seconds: number = REVERB.seconds,
        predelayMs: number = REVERB.predelayMs,
        colour: number = REVERB.colour,
    ): AudioBuffer {
        const { sampleRate } = this.ctx
        const predelay = Math.floor(sampleRate * msToSeconds(predelayMs))
        const tail = Math.floor(sampleRate * seconds)
        const buffer = this.ctx.createBuffer(2, predelay + tail, sampleRate)
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel)
            let lp = 0
            for (let i = predelay; i < data.length; i++) {
                const t = (i - predelay) / tail
                lp += (Math.random() * 2 - 1 - lp) * colour
                data[i] = lp * Math.pow(1 - t, REVERB.decayExponent)
            }
        }
        return buffer
    }

    private createWind(): { gain: GainNode; band: BiquadFilterNode } {
        const ctx = this.ctx
        const length = ctx.sampleRate * WIND.noiseSeconds
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        let lp = 0
        for (let i = 0; i < length; i++) {
            lp += (Math.random() * 2 - 1 - lp) * WIND.noiseSmoothing
            data[i] = lp
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.loop = true

        const band = ctx.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.value = WIND.bandBase
        band.Q.value = WIND.bandQ

        const cap = ctx.createBiquadFilter()
        cap.type = 'lowpass'
        cap.frequency.value = WIND.cap
        cap.Q.value = WIND.capQ

        const sweep = ctx.createOscillator()
        sweep.frequency.value = WIND.sweepHz
        const sweepAmount = ctx.createGain()
        sweepAmount.gain.value = WIND.sweepAmountHz
        sweep.connect(sweepAmount)
        sweepAmount.connect(band.frequency)
        sweep.start()

        const gain = ctx.createGain()
        gain.gain.value = 0

        source.connect(band)
        band.connect(cap)
        cap.connect(gain)
        gain.connect(this.windBus)
        source.start()

        return { gain, band }
    }

    private createDroneStack(fadeInSeconds: number): DroneStack {
        const ctx = this.ctx
        const gain = ctx.createGain()
        gain.gain.value = fadeInSeconds > 0 ? 0 : 1
        gain.connect(this.droneFilter)

        const rootHz = this.currentRootHz()
        const oscillators: OscillatorNode[] = []

        DRONE_DEGREES.forEach((degree, index) => {
            const hz = rootHz * semitoneRatio(degree)
            for (let side = 0; side < 2; side++) {
                const osc = ctx.createOscillator()
                osc.type = 'sawtooth'
                osc.frequency.value = hz
                osc.detune.value =
                    (side === 0 ? -1 : 1) * DRONE.detuneCents * (DRONE.detuneJitterBase + this.random() * DRONE.detuneJitterRange)
                const voiceGain = ctx.createGain()
                voiceGain.gain.value = (DRONE.voiceGainBase / DRONE_DEGREES.length) * (1 - index * DRONE.voiceGainFalloff)
                osc.connect(voiceGain)
                voiceGain.connect(gain)
                osc.start()
                oscillators.push(osc)
            }
        })

        if (fadeInSeconds > 0) {
            gain.gain.cancelScheduledValues(ctx.currentTime)
            gain.gain.setValueCurveAtTime(fadeCurve(true), ctx.currentTime, fadeInSeconds)
        }

        return { gain, oscillators }
    }

    private killDroneStack(stack: DroneStack | null, fadeOutSeconds: number): void {
        if (!stack) return
        const now = this.ctx.currentTime
        stack.gain.gain.cancelScheduledValues(now)
        // setValueCurveAtTime exige une durée strictement positive : suspendGenerative(0)
        // (deep-link direct sur un projet avec musique) demande une coupure instantanée.
        if (fadeOutSeconds > 0) {
            stack.gain.gain.setValueCurveAtTime(fadeCurve(false), now, fadeOutSeconds)
        } else {
            stack.gain.gain.setValueAtTime(0, now)
        }
        stack.oscillators.forEach((osc) => {
            try {
                osc.stop(now + fadeOutSeconds + DRONE.stopBufferSeconds)
            } catch {
                // l'oscillateur était déjà programmé pour s'arrêter
            }
        })
    }

    private modulate = (): void => {
        // Suspendu pendant la lecture d'une piste projet : une modulation ici referait
        // un droneStack sur un bus muet et changerait rootOffset au hasard, désaccordant
        // les SFX de la tonalité du morceau en cours.
        if (!this.running || this.generativeSuspended) return
        if (ROOT_STEPS.length > 1) {
            let next = this.rootOffset
            while (next === this.rootOffset) next = ROOT_STEPS[Math.floor(this.random() * ROOT_STEPS.length)]
            this.rootOffset = next
        }
        const previous = this.droneStack
        this.droneStack = this.createDroneStack(DRONE.modulationFadeIn)
        this.killDroneStack(previous, DRONE.modulationFadeOut)
        this.scheduleModulation()
    }

    private jitter(base: number): number {
        const spread = 1 + IRREGULARITY * JITTER_SPREAD_GAIN
        const ln = Math.log(spread)
        const normaliser = (spread - 1 / spread) / (2 * ln)
        return (base * Math.exp((this.random() * 2 - 1) * ln)) / normaliser
    }

    private schedule(callback: () => void, seconds: number, floorMs: number): void {
        const id = window.setTimeout(callback, Math.max(floorMs, secondsToMs(this.jitter(seconds))))
        this.timers.push(id)
    }

    private voicePool(): number[] {
        const sorted = [...VOICE_CLASSES].sort(
            (a, b) => pitchClassDistance(a, this.rootOffset) - pitchClassDistance(b, this.rootOffset),
        )
        const keep = Math.max(2, Math.round(sorted.length * (1 - this.params.depth * VOICES.poolShrink)))
        return sorted.slice(0, keep)
    }

    private pickPitchClass(): number {
        const pool = this.voicePool()
        return pool[Math.floor(this.random() * pool.length)]
    }

    private pruneVoices(): void {
        const now = this.ctx.currentTime
        this.activeVoices = this.activeVoices.filter((voice) => voice.until >= now)
    }

    private suspendedVoice = (): void => {
        if (!this.running) return
        this.pruneVoices()
        if (this.activeVoices.length >= VOICES.max) {
            this.scheduleVoice()
            return
        }

        const candidates: number[] = []
        this.voicePool().forEach((pitchClass) => {
            VOICES.octaveCandidates.forEach((octave) => {
                const semitone = pitchClass + octave
                const clear = this.activeVoices.every(
                    (voice) => Math.abs(voice.semitone - semitone) >= VOICES.minGapSemitones,
                )
                if (clear) candidates.push(semitone)
            })
        })

        if (!candidates.length) {
            this.scheduleVoice()
            return
        }

        const ctx = this.ctx
        const semitone = candidates[Math.floor(this.random() * candidates.length)]
        const hz = BASE_HZ * semitoneRatio(semitone)

        const osc = ctx.createOscillator()
        osc.type = 'triangle'
        osc.frequency.value = hz
        osc.detune.value = this.random() * VOICES.detuneRange - VOICES.detuneCenter

        const modulator = ctx.createOscillator()
        modulator.type = 'sine'
        modulator.frequency.value = hz * VOICES.modulatorRatio
        const modulation = ctx.createGain()
        modulation.gain.value = hz * (VOICES.modulationDepthBase + this.random() * VOICES.modulationDepthRange)
        modulator.connect(modulation)
        modulation.connect(osc.frequency)

        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.frequency.value = lerp(VOICES.lowpassLow, VOICES.lowpassHigh, this.params.depth)
        lowpass.Q.value = VOICES.lowpassQ

        const gain = ctx.createGain()
        gain.gain.value = 0
        const panner = ctx.createStereoPanner()
        panner.pan.value = this.random() * VOICES.panRange - VOICES.panCenter

        osc.connect(lowpass)
        lowpass.connect(gain)
        gain.connect(panner)
        panner.connect(this.eventBus)

        const now = ctx.currentTime
        const attack = VOICES.attackBase + this.random() * VOICES.attackRange
        const hold = VOICES.holdBase + this.random() * VOICES.holdRange
        const release = VOICES.releaseBase + this.random() * VOICES.releaseRange
        const intimacy = intimacyFromDepth(this.params.depth)
        const peak =
            (VOICES.peakBase + this.random() * VOICES.peakRange) *
            (1 - intimacy * VOICES.peakIntimacyMix) *
            (semitone >= VOICES.upperOctaveSemitone ? VOICES.upperOctaveAttenuation : 1)

        gain.gain.setValueAtTime(SILENCE_GAIN, now)
        gain.gain.exponentialRampToValueAtTime(peak, now + attack)
        gain.gain.setValueAtTime(peak, now + attack + hold)
        gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + attack + hold + release)

        const end = now + attack + hold + release + VOICES.stopBufferSeconds
        osc.start(now)
        modulator.start(now)
        osc.stop(end)
        modulator.stop(end)

        this.activeVoices.push({ semitone, until: end })
        this.scheduleVoice()
    }

    private metallic = (): void => {
        if (!this.running) return
        const ctx = this.ctx
        const hz =
            BASE_HZ *
            semitoneRatio(this.pickPitchClass()) *
            (this.random() < METALLIC.harmonicChoiceProbability ? METALLIC.harmonicLow : METALLIC.harmonicHigh)

        const carrier = ctx.createOscillator()
        carrier.type = 'sine'
        carrier.frequency.value = hz

        const modulator = ctx.createOscillator()
        modulator.type = 'sine'
        modulator.frequency.value = hz * METALLIC.ratio
        const modulation = ctx.createGain()
        modulation.gain.value = hz * (METALLIC.modulationDepthBase + this.random() * METALLIC.modulationDepthRange)
        modulator.connect(modulation)
        modulation.connect(carrier.frequency)

        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.frequency.value = lerp(METALLIC.lowpassLow, METALLIC.lowpassHigh, this.params.depth)
        lowpass.Q.value = METALLIC.lowpassQ

        const gain = ctx.createGain()
        gain.gain.value = 0
        const panner = ctx.createStereoPanner()
        panner.pan.value = this.random() * METALLIC.panRange - METALLIC.panCenter

        carrier.connect(lowpass)
        lowpass.connect(gain)
        gain.connect(panner)
        panner.connect(this.eventBus)

        const now = ctx.currentTime
        const attack = METALLIC.attackBase + this.random() * METALLIC.attackRange
        const decay = METALLIC.decayBase + this.random() * METALLIC.decayRange
        const peak =
            (METALLIC.peakBase + this.random() * METALLIC.peakRange) *
            METALLIC.level *
            lerp(METALLIC.activityMixFloor, 1, this.params.activity)

        gain.gain.setValueAtTime(SILENCE_GAIN, now)
        gain.gain.exponentialRampToValueAtTime(peak, now + attack)
        gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + attack + decay)

        carrier.start(now)
        modulator.start(now)
        carrier.stop(now + attack + decay + METALLIC.stopBufferSeconds)
        modulator.stop(now + attack + decay + METALLIC.stopBufferSeconds)

        this.scheduleMetallic()
    }

    private pianoNote = (delaySeconds = 0): void => {
        if (!this.running) return
        const ctx = this.ctx
        const f0 = BASE_HZ * semitoneRatio(this.pickPitchClass()) * (this.random() < PIANO.octaveUpProbability ? PIANO.octaveUpFactor : 1)
        const now = ctx.currentTime + delaySeconds

        const out = ctx.createGain()
        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.frequency.value = lerp(PIANO.lowpassLow, PIANO.lowpassHigh, this.params.depth)
        lowpass.Q.value = PIANO.lowpassQ
        const panner = ctx.createStereoPanner()
        panner.pan.value = this.random() * PIANO.panRange - PIANO.panCenter

        out.connect(lowpass)
        lowpass.connect(panner)
        panner.connect(this.eventBus)

        const peak = (PIANO.peakBase + this.random() * PIANO.peakRange) * PIANO.amount

        for (let n = 1; n <= PIANO.partials; n++) {
            const hz = n * f0 * Math.sqrt(1 + PIANO.inharmonicity * n * n)
            if (hz > PIANO.partialCeiling) break
            const osc = ctx.createOscillator()
            osc.type = 'sine'
            osc.frequency.value = hz
            osc.detune.value = this.random() * PIANO.partialDetuneRange - PIANO.partialDetuneCenter
            const gain = ctx.createGain()
            const amplitude = peak / Math.pow(n, PIANO.partialRolloff)
            const decay = (PIANO.decayBase + this.random() * PIANO.decayRange) / (1 + n * PIANO.decaySharpness)
            gain.gain.setValueAtTime(SILENCE_GAIN, now)
            gain.gain.exponentialRampToValueAtTime(amplitude, now + PIANO.attackSeconds)
            gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + PIANO.attackSeconds + decay)
            osc.connect(gain)
            gain.connect(out)
            osc.start(now)
            osc.stop(now + PIANO.attackSeconds + decay + PIANO.stopBufferSeconds)
        }

        const hammerLength = Math.floor(ctx.sampleRate * PIANO.hammerSeconds)
        const hammerBuffer = ctx.createBuffer(1, hammerLength, ctx.sampleRate)
        const hammerData = hammerBuffer.getChannelData(0)
        for (let i = 0; i < hammerLength; i++) {
            hammerData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / hammerLength, PIANO.hammerShapeExponent)
        }
        const hammer = ctx.createBufferSource()
        hammer.buffer = hammerBuffer
        const hammerBand = ctx.createBiquadFilter()
        hammerBand.type = 'bandpass'
        hammerBand.frequency.value = Math.min(f0 * PIANO.hammerBandRatio, PIANO.hammerBandCeiling)
        hammerBand.Q.value = PIANO.hammerBandQ
        const hammerGain = ctx.createGain()
        hammerGain.gain.value = peak * PIANO.hammerGainRatio
        hammer.connect(hammerBand)
        hammerBand.connect(hammerGain)
        hammerGain.connect(out)
        hammer.start(now)

        if (delaySeconds === 0) {
            if (this.random() < PIANO.retriggerProbability) {
                this.pianoNote(PIANO.retriggerDelayBase + this.random() * PIANO.retriggerDelayRange)
            }
            this.schedulePiano()
        }
    }

    private scheduleVoice(): void {
        this.schedule(this.suspendedVoice, lerp(VOICES.intervalLow, VOICES.intervalHigh, this.params.depth), VOICES.scheduleFloorMs)
    }

    private scheduleMetallic(): void {
        const density = lerp(METALLIC.densityActivityFloor, 1, this.params.activity) * lerp(METALLIC.densityDepthFloor, 1, this.params.depth)
        this.schedule(this.metallic, lerp(METALLIC.intervalIdle, METALLIC.intervalDense, density), METALLIC.scheduleFloorMs)
    }

    private schedulePiano(): void {
        const interval = PIANO.intervalIdle * Math.pow(PIANO.intervalDense / PIANO.intervalIdle, PIANO.amount)
        this.schedule(() => this.pianoNote(0), interval, PIANO.scheduleFloorMs)
    }

    private scheduleModulation(): void {
        this.schedule(this.modulate, DRONE.modulationSeconds, DRONE.modulationFloorMs)
    }

    private windTransient(intensity: number): void {
        const now = performance.now()
        if (now - this.lastTransient < WIND.transientMinIntervalMs) return
        this.lastTransient = now

        const ctx = this.ctx
        const duration = 0.22
        const length = Math.floor(ctx.sampleRate * duration)
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        let lp = 0
        for (let i = 0; i < length; i++) {
            lp += (Math.random() * 2 - 1 - lp) * WIND.transientSmoothing
            data[i] = lp * Math.pow(1 - i / length, WIND.transientShapeExponent)
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer
        const band = ctx.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.value = WIND.transientBandBase + intensity * WIND.transientBandRange
        band.Q.value = 1.1
        const gain = ctx.createGain()
        const panner = ctx.createStereoPanner()
        panner.pan.value = this.random() * WIND.transientPanRange - WIND.transientPanCenter

        const at = ctx.currentTime
        const peak = WIND.transientLevel * intensity
        gain.gain.setValueAtTime(SILENCE_GAIN, at)
        gain.gain.linearRampToValueAtTime(peak, at + WIND.transientAttackSeconds)
        gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, at + duration)

        source.connect(band)
        band.connect(gain)
        gain.connect(panner)
        panner.connect(this.windBus)
        source.start(at)
        source.stop(at + duration + WIND.transientStopBufferSeconds)
    }

    pushScroll(pixels: number): void {
        if (!this.running) return
        this.pxAccum += pixels
        const isOnset = this.windEnergy < WIND.onsetThreshold
        const intensity = Math.min(1, pixels / SCROLL_NORMALIZE_PX)
        if (isOnset && intensity > WIND.transientOnsetIntensity) this.windTransient(intensity)
        this.markActivity()
    }

    markActivity(): void {
        this.lastActivity = performance.now()
    }

    triggerModulation(): void {
        if (!this.running) return
        this.modulate()
    }

    private updateIdle(): void {
        const idleFor = msToSeconds(performance.now() - this.lastActivity)
        const target = idleFor > IDLE.afterSeconds ? IDLE.floor : 1
        if (Math.abs(target - this.lastIdleTarget) < IDLE.targetEpsilon) return
        this.lastIdleTarget = target
        const now = this.ctx.currentTime
        this.eventBus.gain.cancelScheduledValues(now)
        this.eventBus.gain.setValueAtTime(this.eventBus.gain.value, now)
        this.eventBus.gain.linearRampToValueAtTime(target, now + IDLE.rampSeconds)
    }

    private tick = (timestamp: number): void => {
        if (this.disposed) return
        this.frame = requestAnimationFrame(this.tick)

        // Un intervalle nul diviserait pxAccum par zéro : windEnergy passerait à NaN
        // et y resterait, faisant échouer setTargetAtTime à chaque frame ensuite.
        const elapsed = this.lastFrameTime ? msToSeconds(timestamp - this.lastFrameTime) : FALLBACK_FRAME_SECONDS
        if (elapsed <= 0) return
        const dt = Math.min(MAX_FRAME_SECONDS, elapsed)
        this.lastFrameTime = timestamp
        this.updateIdle()

        const speed = this.pxAccum / dt / WIND.maxSpeed
        const instant = Number.isFinite(speed) ? Math.min(1, speed) : 0
        this.pxAccum = 0
        const tau = instant > this.windEnergy ? WIND.attackTau : WIND.release
        this.windEnergy += (instant - this.windEnergy) * (1 - Math.exp(-dt / tau))
        if (this.windEnergy < WIND.energyFloor) this.windEnergy = 0

        if (Math.abs(this.windEnergy - this.lastWindTarget) < WIND.targetEpsilon) return
        const rising = this.windEnergy > this.lastWindTarget
        this.lastWindTarget = this.windEnergy

        const now = this.ctx.currentTime
        const smoothing = rising ? WIND.attack : WIND.releaseSmoothing
        this.windGain.gain.setTargetAtTime(this.windEnergy * WIND.level, now, smoothing)
        this.windBand.frequency.setTargetAtTime(WIND.bandBase + this.windEnergy * WIND.bandRise, now, smoothing)
    }

    private sfxHz(degree: number, octave: number): number {
        return BASE_HZ * semitoneRatio(foldSemitones(this.rootOffset) + degree + octave * SEMITONES_PER_OCTAVE)
    }

    private sfxBi(): number {
        return this.sfxRandom() * 2 - 1
    }

    private varyPitch(hz: number, amount: number, cents: number): number {
        return hz * semitoneRatio((this.sfxBi() * cents * amount) / CENT_SCALE)
    }

    private varyTime(seconds: number, amount: number): number {
        return seconds * (1 + this.sfxBi() * SFX_VARIANCE.time * amount)
    }

    private varyColour(hz: number, amount: number): number {
        return hz * (1 + this.sfxBi() * SFX_VARIANCE.colour * amount)
    }

    private varyLevel(gain: number, amount: number): number {
        return gain * (1 + this.sfxBi() * SFX_VARIANCE.level * amount)
    }

    // pan.value seul ne fournit pas de point de départ garanti à un linearRamp
    // ultérieur : setValueAtTime est obligatoire ici.
    private sfxOut(source: AudioNode, pan: number, send: number): StereoPannerNode {
        const ctx = this.ctx
        const panner = ctx.createStereoPanner()
        panner.pan.setValueAtTime(Math.max(-1, Math.min(1, pan)), ctx.currentTime)
        source.connect(panner)
        panner.connect(this.sfxGuard)
        if (send > 0) {
            const sendGain = ctx.createGain()
            sendGain.gain.value = send
            panner.connect(sendGain)
            sendGain.connect(this.sfxVerb)
        }
        return panner
    }

    private sfxEnv(gain: GainNode, peak: number, attack: number, seconds: number, now: number): void {
        const safe = Math.max(MIN_AUDIBLE_GAIN, peak)
        gain.gain.setValueAtTime(SILENCE_GAIN, now)
        gain.gain.linearRampToValueAtTime(safe, now + attack)
        gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + Math.max(attack + ENVELOPE_TAIL_SECONDS, seconds))
    }

    private sfxNoise(ms: number, colour: number, shape: number): AudioBuffer {
        const length = Math.max(2, Math.floor(this.ctx.sampleRate * msToSeconds(ms)))
        const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate)
        const data = buffer.getChannelData(0)
        let lp = 0
        for (let i = 0; i < length; i++) {
            lp += (Math.random() * 2 - 1 - lp) * colour
            data[i] = shape > 0 ? lp * Math.pow(1 - i / length, shape) : lp
        }
        return buffer
    }

    // Sinusoïde à chute de hauteur brutale : c'est la chute, pas du bruit, qui fait
    // l'impact. Arthur a écarté toute matière bruitée sur le press.
    private sfxBody(shape: ClickShape, hz: number, level: number, now: number): GainNode {
        const ctx = this.ctx
        const osc = ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.setValueAtTime(Math.min(SFX_CEILING * 2, hz * Math.pow(2, shape.dropOctaves)), now)
        osc.frequency.exponentialRampToValueAtTime(hz, now + shape.dropSeconds)

        const gain = ctx.createGain()
        gain.gain.setValueAtTime(Math.max(MIN_AUDIBLE_GAIN, level * shape.bodyGain), now)
        gain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + shape.bodySeconds)
        osc.connect(gain)
        osc.start(now)
        osc.stop(now + shape.bodySeconds + CLICK_STOP_BUFFER_SECONDS)
        return gain
    }

    private sfxTick(level: number, pan: number): void {
        const ctx = this.ctx
        const now = ctx.currentTime
        const p = SFX_TICK
        const f1 = this.varyPitch(this.sfxHz(p.degree, p.octave), p.variance, p.varianceCents)
        const f2 = this.varyPitch(this.sfxHz(p.secondDegree, p.secondOctave), p.variance, p.varianceCents)
        const seconds = this.varyTime(p.seconds, p.variance)

        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.frequency.value = Math.min(SFX_CEILING, this.varyColour(f2 * p.lowpassRatio, p.variance))
        lowpass.Q.value = p.lowpassQ

        const gain = ctx.createGain()
        this.sfxEnv(gain, this.varyLevel(p.gain * level, p.variance), p.attack, seconds, now)
        lowpass.connect(gain)

        const first = ctx.createOscillator()
        first.type = 'sine'
        first.frequency.value = f1
        first.connect(lowpass)
        first.start(now)
        first.stop(now + seconds + p.stopBufferSeconds)

        const second = ctx.createOscillator()
        second.type = 'sine'
        second.frequency.value = f2
        const secondGain = ctx.createGain()
        secondGain.gain.value = p.secondGain
        second.connect(secondGain)
        secondGain.connect(lowpass)
        second.start(now)
        second.stop(now + seconds + p.stopBufferSeconds)

        if (p.chiffMs > 0 && p.chiffGain > 0) {
            const chiff = ctx.createBufferSource()
            chiff.buffer = this.sfxNoise(p.chiffMs, p.chiffColour, p.chiffShape)
            const band = ctx.createBiquadFilter()
            band.type = 'bandpass'
            band.frequency.value = Math.min(SFX_CEILING, f1 * p.chiffBandRatio)
            band.Q.value = p.chiffQ
            const chiffGain = ctx.createGain()
            chiffGain.gain.value = p.chiffGain * level
            chiff.connect(band)
            band.connect(chiffGain)
            chiffGain.connect(lowpass)
            chiff.start(now)
        }

        this.sfxOut(gain, pan + this.sfxBi() * SFX_VARIANCE.pan * p.variance, p.send)
    }

    // L'écartement du détune est ce qui donne la sensation d'enflure : le balayage de
    // filtre seul sonnait comme une sélection de menu.
    private sfxTileHover(level: number, pan: number): void {
        const ctx = this.ctx
        const now = ctx.currentTime
        const p = SFX_TILE
        const hz = this.varyPitch(this.sfxHz(p.degree, p.octave), p.variance, p.varianceCents)
        const seconds = this.varyTime(p.seconds, p.variance)

        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.Q.value = p.openQ
        lowpass.frequency.setValueAtTime(Math.max(LOWPASS_FLOOR_HZ, hz * p.openFrom), now)
        lowpass.frequency.exponentialRampToValueAtTime(
            Math.min(SFX_CEILING, this.varyColour(hz * p.openTo, p.variance)),
            now + p.openSeconds,
        )

        for (let side = 0; side < 2; side++) {
            const osc = ctx.createOscillator()
            osc.type = 'triangle'
            osc.frequency.value = hz
            const sign = side === 0 ? -1 : 1
            osc.detune.setValueAtTime(sign * p.spreadCents, now)
            osc.detune.linearRampToValueAtTime(sign * p.spreadTo, now + p.openSeconds)
            osc.connect(lowpass)
            osc.start(now)
            osc.stop(now + seconds + p.stopBufferSeconds)
        }

        const gain = ctx.createGain()
        this.sfxEnv(gain, this.varyLevel(p.gain * level, p.variance), p.attack, seconds, now)
        lowpass.connect(gain)
        this.sfxOut(gain, pan + this.sfxBi() * SFX_VARIANCE.pan * p.variance, p.send)
    }

    private sfxPress(level: number, pan: number): void {
        const ctx = this.ctx
        const now = ctx.currentTime
        const p = SFX_PRESS
        const hz = this.varyPitch(this.sfxHz(p.degree, p.octave), p.variance, p.varianceCents)
        const peak = this.varyLevel(p.gain * level, p.variance)

        const out = ctx.createGain()
        this.sfxBody(p, hz, peak, now).connect(out)

        const twin: ClickShape = {
            ...p,
            dropOctaves: p.twinDrop,
            bodyGain: p.twinGain,
            bodySeconds: p.twinSeconds,
        }
        this.sfxBody(twin, hz * semitoneRatio(p.twinDegree), peak, now).connect(out)

        this.sfxOut(out, pan + this.sfxBi() * SFX_VARIANCE.pan * p.variance, p.send)
    }

    private sfxRelease(level: number, pan: number): void {
        const ctx = this.ctx
        const now = ctx.currentTime
        const p = SFX_RELEASE
        const hz = this.varyPitch(this.sfxHz(p.degree, p.octave), p.variance, p.varianceCents)
        const peak = this.varyLevel(p.gain * level, p.variance)

        const out = ctx.createGain()

        const click = ctx.createBufferSource()
        click.buffer = this.sfxNoise(p.clickMs, p.clickColour, p.clickShape)
        const band = ctx.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.value = Math.min(SFX_CEILING, this.varyColour(hz * p.clickRatio, p.variance))
        band.Q.value = p.clickQ
        const clickGain = ctx.createGain()
        clickGain.gain.setValueAtTime(Math.max(MIN_AUDIBLE_GAIN, peak * p.clickGain), now)
        clickGain.gain.exponentialRampToValueAtTime(SILENCE_GAIN, now + Math.max(p.clickMinSeconds, p.seconds))
        click.connect(band)
        band.connect(clickGain)
        clickGain.connect(out)
        click.start(now)

        this.sfxBody(p, hz, peak, now).connect(out)

        this.sfxOut(out, pan + this.sfxBi() * SFX_VARIANCE.pan * p.variance, p.send)
    }

    // Deux notes brèves montant d'une quarte, chacune frappée comme une barre de métal.
    // Le son est identique à chaque clic : une montée cumulative à la répétition rendait
    // le geste pénible au lieu de le récompenser.
    private sfxLike(level: number, pan: number): void {
        const ctx = this.ctx
        const now = ctx.currentTime
        const p = SFX_LIKE
        const base = this.varyPitch(this.sfxHz(p.degree, p.octave), p.variance, p.varianceCents)
        const peak = this.varyLevel(p.gain * level, p.variance)

        const out = ctx.createGain()
        this.sfxOut(out, pan, p.send)

        const strike = (hz: number, at: number, seconds: number, gainLevel: number) => {
            const partials: [number, number][] = [
                [1, 1],
                [p.partialA, p.partialAGain],
                [p.partialB, p.partialBGain],
            ]
            // Les partiels se somment : sans normalisation la crête vaut gain × 1,9, le
            // like devient le son le plus fort du site et enfonce le compresseur du bus,
            // qui étouffe alors les clics suivants. La somme ne porte que sur les
            // partiels retenus, pour que le niveau ne dépende pas de la tonalité.
            const kept = partials.filter(([ratio]) => hz * ratio <= p.ceiling)
            const weightSum = kept.reduce((total, [, weight]) => total + weight, 0) || 1

            partials.forEach(([ratio, weight], index) => {
                const frequency = hz * ratio
                // Un partiel trop haut est omis, jamais rabattu sur le plafond : le
                // ramener produirait une fréquence arbitraire, donc une fausse note.
                if (frequency > p.ceiling) return
                const osc = ctx.createOscillator()
                osc.type = 'sine'
                osc.frequency.value = frequency
                // Les modes aigus s'éteignent les premiers : c'est cette différence qui
                // fait entendre une attaque métallique puis une résonance claire.
                const decay = seconds * Math.pow(p.partialDecay, index)
                const gain = ctx.createGain()
                this.sfxEnv(gain, (gainLevel * weight) / weightSum, p.attack, decay, at)
                osc.connect(gain)
                gain.connect(out)
                osc.start(at)
                osc.stop(at + decay + p.stopBufferSeconds)
            })
        }

        strike(base, now, p.firstSeconds, peak)
        strike(base * semitoneRatio(p.interval), now + p.gapSeconds, p.secondSeconds, peak)
    }

    // Aucun portamento : un glissando montant sonne comme un saut de jeu vidéo. Le
    // mouvement passe par le filtre et le panoramique, les hauteurs sont fixes et
    // reprennent les degrés du drone, ce qui rend l'accord infaillible.
    private sfxNav(p: NavShape, level: number, pan: number, still: boolean): void {
        const ctx = this.ctx
        const now = ctx.currentTime
        const hz = this.varyPitch(this.sfxHz(p.degree, p.octave), p.variance, p.varianceCents)
        const seconds = this.varyTime(p.seconds, p.variance)

        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.Q.value = p.openQ
        lowpass.frequency.setValueAtTime(Math.max(LOWPASS_FLOOR_HZ, hz * p.openFrom), now)
        lowpass.frequency.exponentialRampToValueAtTime(
            Math.min(SFX_CEILING, this.varyColour(hz * p.openTo, p.variance)),
            now + p.openPeak,
        )
        lowpass.frequency.exponentialRampToValueAtTime(Math.max(LOWPASS_FLOOR_HZ, hz * p.closeTo), now + seconds)

        const gain = ctx.createGain()
        this.sfxEnv(gain, this.varyLevel(p.gain * level, p.variance), p.attack, seconds, now)
        lowpass.connect(gain)

        const degrees = [0, p.voiceB, p.voiceC]
        degrees.forEach((degree, index) => {
            const osc = ctx.createOscillator()
            osc.type = 'triangle'
            osc.frequency.value = hz * semitoneRatio(degree)
            osc.detune.value = this.sfxBi() * p.varianceCents * SFX_NAV_SHAPE.voiceDetuneScale * p.variance
            const voiceGain = ctx.createGain()
            voiceGain.gain.value = 1 / (1 + index * SFX_NAV_SHAPE.voiceGainFalloff)
            osc.connect(voiceGain)
            voiceGain.connect(lowpass)
            osc.start(now + index * p.spread)
            osc.stop(now + seconds + SFX_NAV_SHAPE.stopBufferSeconds)
        })

        const spread = still ? 0 : p.panSpread
        const panner = this.sfxOut(gain, pan - spread, p.send * p.tailGain)
        if (spread > 0) {
            panner.pan.linearRampToValueAtTime(Math.max(-1, Math.min(1, pan + spread)), now + seconds)
        }
    }

    playSfx(name: SfxName, options: SfxOptions = {}): void {
        if (!this.running || this.disposed) return
        if (name !== 'navInternal' && name !== 'navExternal' && this.getOutputLatencyMs() > SFX_GATE.latencyGateMs) {
            return
        }

        const now = performance.now()
        const previous = this.sfxLast.get(name) ?? 0
        const cooldown =
            name === 'tick'
                ? SFX_GATE.tickCooldownMs
                : name === 'tileHover'
                  ? SFX_GATE.tileCooldownMs
                  : name === 'navInternal' || name === 'navExternal'
                    ? SFX_GATE.navCooldownMs
                    : name === 'like'
                      ? SFX_GATE.likeCooldownMs
                      : SFX_GATE.buttonCooldownMs
        if (now - previous < cooldown) return

        // L'écart global ne protège que des rafales de survol, qui sont automatiques.
        // Un son qui répond à un geste délibéré n'est jamais supprimé : sinon un tick
        // parasite (une animation qui remonte un nœud sous le curseur suffit à en
        // produire un) rend le clic muet, par intermittence et sans raison visible.
        const deliberate = name !== 'tick' && name !== 'tileHover'
        if (!deliberate && now - this.sfxLastAny < SFX_GATE.minGapMs) return

        // Le like garde son niveau en rafale : le faire faiblir découragerait le clic
        // répété, qui est justement ce que ce bouton cherche à provoquer.
        const burst =
            name !== 'like' && now - previous < SFX_GATE.burstWindowMs
                ? Math.max(SFX_GATE.burstFloor, (this.sfxBurst.get(name) ?? 1) * SFX_GATE.burstDecay)
                : 1
        this.sfxBurst.set(name, burst)
        this.sfxLast.set(name, now)
        this.sfxLastAny = now
        this.markActivity()

        const level = (options.gain ?? 1) * burst
        const pan = options.pan ?? 0

        switch (name) {
            case 'tick':
                return this.sfxTick(level, pan)
            case 'tileHover':
                return this.sfxTileHover(level, pan)
            case 'press':
                return this.sfxPress(level, pan)
            case 'release':
                return this.sfxRelease(level, pan)
            case 'navInternal':
                return this.sfxNav(SFX_NAV, level, pan, options.still ?? false)
            case 'navExternal':
                return this.sfxNav(SFX_EXT, level, pan, options.still ?? false)
            case 'like':
                return this.sfxLike(level, pan)
        }
    }

    // exponentialRampToValueAtTime ne peut ni viser ni partir de zéro strict : on
    // rampe vers SILENCE_GAIN puis on force 0, et on part toujours d'une valeur
    // courante plancherée au même niveau.
    private rampExponential(param: AudioParam, target: number, seconds: number): void {
        const now = this.ctx.currentTime
        param.cancelScheduledValues(now)
        // Une rampe de durée nulle (coupure instantanée, ex. deep-link direct sur un
        // projet avec musique) donnerait un ratio 0/0 à exponentialRampToValueAtTime :
        // on bascule alors la valeur directement.
        if (seconds <= 0) {
            param.setValueAtTime(target, now)
            return
        }
        const current = Math.max(SILENCE_GAIN, param.value)
        param.setValueAtTime(current, now)
        if (target <= SILENCE_GAIN) {
            param.exponentialRampToValueAtTime(SILENCE_GAIN, now + seconds)
            param.setValueAtTime(0, now + seconds)
        } else {
            param.exponentialRampToValueAtTime(target, now + seconds)
        }
    }

    // Force la racine utilisée par currentRootHz() (donc par sfxHz()) : c'est ce qui
    // accorde les SFX de micro-interaction sur la tonalité d'une piste projet.
    setRootOffset(semitones: number): void {
        this.rootOffset = semitones
    }

    // Coupe la générative (drone, voix, métallique, piano, vent) au profit d'une piste
    // projet. Les SFX ne sont pas concernés : ils vivent sur un bus séparé.
    suspendGenerative(fadeSeconds: number = MUSIC.crossfadeSeconds): void {
        if (this.disposed || this.generativeSuspended) return
        this.generativeSuspended = true

        this.timers.forEach((id) => window.clearTimeout(id))
        this.timers = []
        this.activeVoices = []

        const previousDrone = this.droneStack
        this.droneStack = null
        this.killDroneStack(previousDrone, fadeSeconds)

        this.rampExponential(this.generativeMute.gain, 0, fadeSeconds)
    }

    // Relance la générative (nouveau drone stack, boucles de composition) quand plus
    // aucune piste projet n'est active.
    resumeGenerative(fadeSeconds: number = MUSIC.crossfadeSeconds): void {
        if (this.disposed || !this.generativeSuspended) return
        this.generativeSuspended = false

        this.droneStack = this.createDroneStack(fadeSeconds)
        this.rampExponential(this.generativeMute.gain, 1, fadeSeconds)

        if (this.running) {
            this.scheduleVoice()
            this.scheduleMetallic()
            this.schedulePiano()
            this.scheduleModulation()
        }
    }

    private ensureTrackNodes(): void {
        if (this.trackAudio) return
        const audio = new Audio()
        audio.crossOrigin = 'anonymous'
        audio.loop = true
        audio.preload = 'auto'
        this.trackAudio = audio
        this.trackSource = this.ctx.createMediaElementSource(audio)
        this.trackSource.connect(this.trackGain)
    }

    // startAt ne s'applique qu'au premier lancement d'une piste : la boucle native de
    // l'élément <audio> reprend ensuite au timecode 0.
    async playTrack(
        track: { url: string; startAt?: number; volume?: number; rootOffset?: number },
        fadeSeconds: number = MUSIC.crossfadeSeconds,
    ): Promise<void> {
        if (this.disposed) return
        this.ensureTrackNodes()
        const audio = this.trackAudio
        if (!audio) return

        window.clearTimeout(this.trackStopTimer)

        const isNewTrack = this.currentTrackUrl !== track.url
        this.currentTrackUrl = track.url

        if (typeof track.rootOffset === 'number') this.setRootOffset(track.rootOffset)
        this.trackGain.gain.value = track.volume ?? MUSIC.defaultVolume

        if (isNewTrack) {
            audio.src = track.url
            audio.currentTime = track.startAt ?? 0
        }

        if (this.running) {
            try {
                await audio.play()
            } catch {
                // Lecture bloquée par la politique d'autoplay : reprendra au prochain
                // geste utilisateur, qui relance start().
            }
        }

        this.rampExponential(this.trackFade.gain, 1, fadeSeconds)
    }

    stopTrack(fadeSeconds: number = MUSIC.crossfadeSeconds): void {
        if (!this.trackAudio || !this.currentTrackUrl) return
        this.currentTrackUrl = null
        this.rampExponential(this.trackFade.gain, 0, fadeSeconds)

        window.clearTimeout(this.trackStopTimer)
        const audio = this.trackAudio
        this.trackStopTimer = window.setTimeout(
            () => {
                // Un start() entretemps a pu relancer la lecture : ne pas l'interrompre.
                if (!this.running || !this.currentTrackUrl) audio.pause()
            },
            secondsToMs(fadeSeconds) + MUSIC.pauseBufferMs,
        )
    }

    setParams(next: Partial<AmbientParams>): void {
        this.params = { ...this.params, ...next }
        this.applyParams(false)
    }

    private applyParams(immediate: boolean): void {
        const now = this.ctx.currentTime
        const ramp = immediate ? MIX.immediateRampSeconds : MIX.paramRamp
        const set = (param: AudioParam, value: number) => {
            param.cancelScheduledValues(now)
            param.setValueAtTime(param.value, now)
            param.linearRampToValueAtTime(value, now + ramp)
        }

        const { depth } = this.params
        set(this.droneFilter.frequency, lerp(DRONE.cutoffLow, DRONE.cutoffHigh, depth))

        const intimacy = intimacyFromDepth(depth)
        set(this.wet.gain, lerp(MIX.wetIntimacyHigh, MIX.wetIntimacyLow, intimacy))
        set(this.dry.gain, lerp(MIX.dryIntimacyLow, 1, intimacy))
    }

    async start(): Promise<void> {
        if (this.disposed || this.running) return
        if (this.ctx.state === 'suspended') await this.ctx.resume()
        this.running = true

        const now = this.ctx.currentTime
        this.fade.gain.cancelScheduledValues(now)
        this.fade.gain.setValueAtTime(this.fade.gain.value, now)
        this.fade.gain.linearRampToValueAtTime(1, now + MIX.fadeIn)

        // Suspendue par un deep-link direct sur un projet avec musique (cf.
        // AudioProvider) : la générative ne doit pas démarrer avant de retomber en
        // silence quelques centaines de ms plus tard.
        if (!this.generativeSuspended) {
            this.scheduleVoice()
            this.scheduleMetallic()
            this.schedulePiano()
            this.scheduleModulation()
            this.timers.push(window.setTimeout(this.suspendedVoice, STARTUP.firstVoiceDelayMs))
        }
        // Premier passage dans un patch à volume nul : absorbe la compilation JIT et
        // le premier rendu du convolver SFX, sinon le tout premier tick réel traîne.
        this.timers.push(window.setTimeout(() => this.sfxTick(STARTUP.primingGain, 0), STARTUP.primingDelayMs))

        this.lastFrameTime = 0
        this.lastActivity = performance.now()
        cancelAnimationFrame(this.frame)
        this.frame = requestAnimationFrame(this.tick)

        if (this.currentTrackUrl && this.trackAudio) {
            window.clearTimeout(this.trackStopTimer)
            try {
                await this.trackAudio.play()
            } catch {
                // Reprendra au prochain geste utilisateur qui relance start().
            }
            this.rampExponential(this.trackFade.gain, 1, MUSIC.crossfadeSeconds)
        }
    }

    stop(): void {
        if (!this.running) return
        this.running = false
        this.timers.forEach((id) => window.clearTimeout(id))
        this.timers = []
        this.activeVoices = []

        // La boucle est coupée tout de suite : le fondu est une rampe planifiée sur
        // l'AudioParam, il n'en dépend pas. Un arrêt différé laissait une seconde
        // boucle démarrer par-dessus, avec des timestamps identiques à la première.
        cancelAnimationFrame(this.frame)
        this.frame = 0

        const now = this.ctx.currentTime
        this.fade.gain.cancelScheduledValues(now)
        this.fade.gain.setValueAtTime(this.fade.gain.value, now)
        this.fade.gain.linearRampToValueAtTime(0, now + MIX.fadeOut)

        // La piste ne traverse pas this.fade (elle bypasse l'EQ générative, cf.
        // constructeur) : sans ceci elle continuerait de jouer après la coupure du son.
        if (this.trackAudio && this.currentTrackUrl) {
            this.rampExponential(this.trackFade.gain, 0, MIX.fadeOut)
            window.clearTimeout(this.trackStopTimer)
            const audio = this.trackAudio
            this.trackStopTimer = window.setTimeout(
                () => {
                    if (!this.running) audio.pause()
                },
                secondsToMs(MIX.fadeOut) + MUSIC.pauseBufferMs,
            )
        }
    }

    dispose(): void {
        this.stop()
        this.disposed = true
        cancelAnimationFrame(this.frame)
        window.clearTimeout(this.trackStopTimer)
        if (this.trackAudio) {
            this.trackAudio.pause()
            this.trackAudio.src = ''
        }
        window.setTimeout(
            () => {
                void this.ctx.close()
            },
            secondsToMs(MIX.fadeOut) + DISPOSE_BUFFER_MS,
        )
    }
}

export { clamp01 }
