import {
    BASE_HZ,
    DRONE_DEGREES,
    ROOT_STEPS,
    VOICE_CLASSES,
    createPrng,
    createSeed,
    pitchClassDistance,
    semitoneRatio,
    type Prng,
} from './scales'
import {
    DEFAULT_PARAMS,
    DRONE,
    IDLE,
    IRREGULARITY,
    METALLIC,
    MIX,
    OUTPUT,
    PIANO,
    REVERB,
    SFX_BUS,
    SFX_CEILING,
    SFX_EXT,
    SFX_GATE,
    SFX_LIKE,
    SFX_NAV,
    SFX_PRESS,
    SFX_RELEASE,
    SFX_TICK,
    SFX_TILE,
    SFX_VARIANCE,
    VOICES,
    WIND,
    clamp01,
    intimacyFromDepth,
    lerp,
    type AmbientParams,
    type SfxName,
    type SfxOptions,
} from './params'

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

        const compressor = ctx.createDynamicsCompressor()
        compressor.threshold.value = -26
        compressor.knee.value = 28
        compressor.ratio.value = 3
        compressor.attack.value = 0.05
        compressor.release.value = 0.5

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
        this.brillance.connect(compressor)
        compressor.connect(limiter)
        limiter.connect(ctx.destination)

        this.dry = ctx.createGain()
        this.wet = ctx.createGain()
        this.convolver = ctx.createConvolver()
        this.convolver.buffer = this.createImpulse()
        this.dry.connect(this.preMix)
        this.convolver.connect(this.wet)
        this.wet.connect(this.preMix)

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
        this.sfxRandom = createPrng((seed ^ 0x9e3779b9) >>> 0)

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
        return (this.ctx.outputLatency || 0) * 1000
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
        const predelay = Math.floor((sampleRate * predelayMs) / 1000)
        const tail = Math.floor(sampleRate * seconds)
        const buffer = this.ctx.createBuffer(2, predelay + tail, sampleRate)
        for (let channel = 0; channel < 2; channel++) {
            const data = buffer.getChannelData(channel)
            let lp = 0
            for (let i = predelay; i < data.length; i++) {
                const t = (i - predelay) / tail
                lp += (Math.random() * 2 - 1 - lp) * colour
                data[i] = lp * Math.pow(1 - t, 2.4)
            }
        }
        return buffer
    }

    private createWind(): { gain: GainNode; band: BiquadFilterNode } {
        const ctx = this.ctx
        const length = ctx.sampleRate * 4
        const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
        const data = buffer.getChannelData(0)
        let lp = 0
        for (let i = 0; i < length; i++) {
            lp += (Math.random() * 2 - 1 - lp) * 0.55
            data[i] = lp
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer
        source.loop = true

        const band = ctx.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.value = WIND.bandBase
        band.Q.value = 1.3

        const cap = ctx.createBiquadFilter()
        cap.type = 'lowpass'
        cap.frequency.value = WIND.cap
        cap.Q.value = 0.5

        const sweep = ctx.createOscillator()
        sweep.frequency.value = 0.037
        const sweepAmount = ctx.createGain()
        sweepAmount.gain.value = 200
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
                osc.detune.value = (side === 0 ? -1 : 1) * DRONE.detuneCents * (0.7 + this.random() * 0.6)
                const voiceGain = ctx.createGain()
                voiceGain.gain.value = (0.13 / DRONE_DEGREES.length) * (1 - index * 0.13)
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
        stack.gain.gain.setValueCurveAtTime(fadeCurve(false), now, fadeOutSeconds)
        stack.oscillators.forEach((osc) => {
            try {
                osc.stop(now + fadeOutSeconds + 0.2)
            } catch {
                // l'oscillateur était déjà programmé pour s'arrêter
            }
        })
    }

    private modulate = (): void => {
        if (!this.running) return
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
        const spread = 1 + IRREGULARITY * 1.6
        const ln = Math.log(spread)
        const normaliser = (spread - 1 / spread) / (2 * ln)
        return (base * Math.exp((this.random() * 2 - 1) * ln)) / normaliser
    }

    private schedule(callback: () => void, seconds: number, floorMs: number): void {
        const id = window.setTimeout(callback, Math.max(floorMs, this.jitter(seconds) * 1000))
        this.timers.push(id)
    }

    private voicePool(): number[] {
        const sorted = [...VOICE_CLASSES].sort(
            (a, b) => pitchClassDistance(a, this.rootOffset) - pitchClassDistance(b, this.rootOffset),
        )
        const keep = Math.max(2, Math.round(sorted.length * (1 - this.params.depth * 0.5)))
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
            ;[12, 12, 12, 24].forEach((octave) => {
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
        osc.detune.value = this.random() * 14 - 7

        const modulator = ctx.createOscillator()
        modulator.type = 'sine'
        modulator.frequency.value = hz * 1.487
        const modulation = ctx.createGain()
        modulation.gain.value = hz * (0.004 + this.random() * 0.01)
        modulator.connect(modulation)
        modulation.connect(osc.frequency)

        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.frequency.value = lerp(VOICES.lowpassLow, VOICES.lowpassHigh, this.params.depth)
        lowpass.Q.value = 0.9

        const gain = ctx.createGain()
        gain.gain.value = 0
        const panner = ctx.createStereoPanner()
        panner.pan.value = this.random() * 1.2 - 0.6

        osc.connect(lowpass)
        lowpass.connect(gain)
        gain.connect(panner)
        panner.connect(this.eventBus)

        const now = ctx.currentTime
        const attack = 4 + this.random() * 7
        const hold = 3 + this.random() * 6
        const release = 6 + this.random() * 8
        const intimacy = intimacyFromDepth(this.params.depth)
        const peak = (0.05 + this.random() * 0.05) * (1 - intimacy * 0.25) * (semitone >= 24 ? 0.5 : 1)

        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(peak, now + attack)
        gain.gain.setValueAtTime(peak, now + attack + hold)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + hold + release)

        const end = now + attack + hold + release + 0.2
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
        const hz = BASE_HZ * semitoneRatio(this.pickPitchClass()) * (this.random() < 0.5 ? 2 : 3)

        const carrier = ctx.createOscillator()
        carrier.type = 'sine'
        carrier.frequency.value = hz

        const modulator = ctx.createOscillator()
        modulator.type = 'sine'
        modulator.frequency.value = hz * METALLIC.ratio
        const modulation = ctx.createGain()
        modulation.gain.value = hz * (0.22 + this.random() * 0.58)
        modulator.connect(modulation)
        modulation.connect(carrier.frequency)

        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.frequency.value = lerp(METALLIC.lowpassLow, METALLIC.lowpassHigh, this.params.depth)
        lowpass.Q.value = 0.6

        const gain = ctx.createGain()
        gain.gain.value = 0
        const panner = ctx.createStereoPanner()
        panner.pan.value = this.random() * 1.7 - 0.85

        carrier.connect(lowpass)
        lowpass.connect(gain)
        gain.connect(panner)
        panner.connect(this.eventBus)

        const now = ctx.currentTime
        const attack = 0.35 + this.random() * 1.05
        const decay = 3.5 + this.random() * 5.5
        const peak = (0.012 + this.random() * 0.026) * METALLIC.level * lerp(0.4, 1, this.params.activity)

        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.exponentialRampToValueAtTime(peak, now + attack)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay)

        carrier.start(now)
        modulator.start(now)
        carrier.stop(now + attack + decay + 0.2)
        modulator.stop(now + attack + decay + 0.2)

        this.scheduleMetallic()
    }

    private pianoNote = (delaySeconds = 0): void => {
        if (!this.running) return
        const ctx = this.ctx
        const f0 = BASE_HZ * semitoneRatio(this.pickPitchClass()) * (this.random() < 0.4 ? 2 : 1)
        const now = ctx.currentTime + delaySeconds

        const out = ctx.createGain()
        const lowpass = ctx.createBiquadFilter()
        lowpass.type = 'lowpass'
        lowpass.frequency.value = lerp(PIANO.lowpassLow, PIANO.lowpassHigh, this.params.depth)
        lowpass.Q.value = 0.7
        const panner = ctx.createStereoPanner()
        panner.pan.value = this.random() * 0.9 - 0.45

        out.connect(lowpass)
        lowpass.connect(panner)
        panner.connect(this.eventBus)

        const peak = (0.05 + this.random() * 0.045) * PIANO.amount

        for (let n = 1; n <= PIANO.partials; n++) {
            const hz = n * f0 * Math.sqrt(1 + PIANO.inharmonicity * n * n)
            if (hz > PIANO.partialCeiling) break
            const osc = ctx.createOscillator()
            osc.type = 'sine'
            osc.frequency.value = hz
            osc.detune.value = this.random() * 8 - 4
            const gain = ctx.createGain()
            const amplitude = peak / Math.pow(n, 1.5)
            const decay = (5 + this.random() * 4) / (1 + n * 0.55)
            gain.gain.setValueAtTime(0.0001, now)
            gain.gain.exponentialRampToValueAtTime(amplitude, now + 0.012)
            gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.012 + decay)
            osc.connect(gain)
            gain.connect(out)
            osc.start(now)
            osc.stop(now + 0.012 + decay + 0.1)
        }

        const hammerLength = Math.floor(ctx.sampleRate * 0.04)
        const hammerBuffer = ctx.createBuffer(1, hammerLength, ctx.sampleRate)
        const hammerData = hammerBuffer.getChannelData(0)
        for (let i = 0; i < hammerLength; i++) {
            hammerData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / hammerLength, 3)
        }
        const hammer = ctx.createBufferSource()
        hammer.buffer = hammerBuffer
        const hammerBand = ctx.createBiquadFilter()
        hammerBand.type = 'bandpass'
        hammerBand.frequency.value = Math.min(f0 * 2.2, 2000)
        hammerBand.Q.value = 0.8
        const hammerGain = ctx.createGain()
        hammerGain.gain.value = peak * 0.16
        hammer.connect(hammerBand)
        hammerBand.connect(hammerGain)
        hammerGain.connect(out)
        hammer.start(now)

        if (delaySeconds === 0) {
            if (this.random() < 0.32) this.pianoNote(0.5 + this.random() * 1.2)
            this.schedulePiano()
        }
    }

    private scheduleVoice(): void {
        this.schedule(this.suspendedVoice, lerp(VOICES.intervalLow, VOICES.intervalHigh, this.params.depth), 1800)
    }

    private scheduleMetallic(): void {
        const density = lerp(0.25, 1, this.params.activity) * lerp(0.5, 1, this.params.depth)
        this.schedule(this.metallic, lerp(METALLIC.intervalIdle, METALLIC.intervalDense, density), 2000)
    }

    private schedulePiano(): void {
        const interval = PIANO.intervalIdle * Math.pow(PIANO.intervalDense / PIANO.intervalIdle, PIANO.amount)
        this.schedule(() => this.pianoNote(0), interval, 1200)
    }

    private scheduleModulation(): void {
        this.schedule(this.modulate, DRONE.modulationSeconds, 8000)
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
            lp += (Math.random() * 2 - 1 - lp) * 0.75
            data[i] = lp * Math.pow(1 - i / length, 2.5)
        }

        const source = ctx.createBufferSource()
        source.buffer = buffer
        const band = ctx.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.value = 700 + intensity * 600
        band.Q.value = 1.1
        const gain = ctx.createGain()
        const panner = ctx.createStereoPanner()
        panner.pan.value = this.random() * 0.6 - 0.3

        const at = ctx.currentTime
        const peak = WIND.transientLevel * intensity
        gain.gain.setValueAtTime(0.0001, at)
        gain.gain.linearRampToValueAtTime(peak, at + 0.003)
        gain.gain.exponentialRampToValueAtTime(0.0001, at + duration)

        source.connect(band)
        band.connect(gain)
        gain.connect(panner)
        panner.connect(this.windBus)
        source.start(at)
        source.stop(at + duration + 0.05)
    }

    pushScroll(pixels: number): void {
        if (!this.running) return
        this.pxAccum += pixels
        const isOnset = this.windEnergy < WIND.onsetThreshold
        const intensity = Math.min(1, pixels / 60)
        if (isOnset && intensity > 0.07) this.windTransient(intensity)
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
        const idleFor = (performance.now() - this.lastActivity) / 1000
        const target = idleFor > IDLE.afterSeconds ? IDLE.floor : 1
        if (Math.abs(target - this.lastIdleTarget) < 0.01) return
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
        const elapsed = this.lastFrameTime ? (timestamp - this.lastFrameTime) / 1000 : 0.016
        if (elapsed <= 0) return
        const dt = Math.min(0.1, elapsed)
        this.lastFrameTime = timestamp
        this.updateIdle()

        const speed = this.pxAccum / dt / WIND.maxSpeed
        const instant = Number.isFinite(speed) ? Math.min(1, speed) : 0
        this.pxAccum = 0
        const tau = instant > this.windEnergy ? 0.02 : WIND.release
        this.windEnergy += (instant - this.windEnergy) * (1 - Math.exp(-dt / tau))
        if (this.windEnergy < 0.001) this.windEnergy = 0

        if (Math.abs(this.windEnergy - this.lastWindTarget) < 0.004) return
        const rising = this.windEnergy > this.lastWindTarget
        this.lastWindTarget = this.windEnergy

        const now = this.ctx.currentTime
        const smoothing = rising ? WIND.attack : 0.05
        this.windGain.gain.setTargetAtTime(this.windEnergy * WIND.level, now, smoothing)
        this.windBand.frequency.setTargetAtTime(WIND.bandBase + this.windEnergy * WIND.bandRise, now, smoothing)
    }

    private sfxHz(degree: number, octave: number): number {
        return this.currentRootHz() * semitoneRatio(degree + octave * 12)
    }

    private sfxBi(): number {
        return this.sfxRandom() * 2 - 1
    }

    private varyPitch(hz: number, amount: number, cents: number): number {
        return hz * semitoneRatio((this.sfxBi() * cents * amount) / 100)
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
        const safe = Math.max(0.0002, peak)
        gain.gain.setValueAtTime(0.0001, now)
        gain.gain.linearRampToValueAtTime(safe, now + attack)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(attack + 0.01, seconds))
    }

    private sfxNoise(ms: number, colour: number, shape: number): AudioBuffer {
        const length = Math.max(2, Math.floor((this.ctx.sampleRate * ms) / 1000))
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
        gain.gain.setValueAtTime(Math.max(0.0002, level * shape.bodyGain), now)
        gain.gain.exponentialRampToValueAtTime(0.0001, now + shape.bodySeconds)
        osc.connect(gain)
        osc.start(now)
        osc.stop(now + shape.bodySeconds + 0.05)
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
        first.stop(now + seconds + 0.1)

        const second = ctx.createOscillator()
        second.type = 'sine'
        second.frequency.value = f2
        const secondGain = ctx.createGain()
        secondGain.gain.value = p.secondGain
        second.connect(secondGain)
        secondGain.connect(lowpass)
        second.start(now)
        second.stop(now + seconds + 0.1)

        if (p.chiffMs > 0 && p.chiffGain > 0) {
            const chiff = ctx.createBufferSource()
            chiff.buffer = this.sfxNoise(p.chiffMs, 0.8, 3)
            const band = ctx.createBiquadFilter()
            band.type = 'bandpass'
            band.frequency.value = Math.min(SFX_CEILING, f1 * 1.5)
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
        lowpass.frequency.setValueAtTime(Math.max(60, hz * p.openFrom), now)
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
            osc.stop(now + seconds + 0.15)
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
        click.buffer = this.sfxNoise(p.clickMs, p.clickColour, 2.2)
        const band = ctx.createBiquadFilter()
        band.type = 'bandpass'
        band.frequency.value = Math.min(SFX_CEILING, this.varyColour(hz * p.clickRatio, p.variance))
        band.Q.value = p.clickQ
        const clickGain = ctx.createGain()
        clickGain.gain.setValueAtTime(Math.max(0.0002, peak * p.clickGain), now)
        clickGain.gain.exponentialRampToValueAtTime(0.0001, now + Math.max(0.008, p.seconds))
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
                osc.stop(at + decay + 0.1)
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
        lowpass.frequency.setValueAtTime(Math.max(60, hz * p.openFrom), now)
        lowpass.frequency.exponentialRampToValueAtTime(
            Math.min(SFX_CEILING, this.varyColour(hz * p.openTo, p.variance)),
            now + p.openPeak,
        )
        lowpass.frequency.exponentialRampToValueAtTime(Math.max(60, hz * p.closeTo), now + seconds)

        const gain = ctx.createGain()
        this.sfxEnv(gain, this.varyLevel(p.gain * level, p.variance), p.attack, seconds, now)
        lowpass.connect(gain)

        const degrees = [0, p.voiceB, p.voiceC]
        degrees.forEach((degree, index) => {
            const osc = ctx.createOscillator()
            osc.type = 'triangle'
            osc.frequency.value = hz * semitoneRatio(degree)
            osc.detune.value = this.sfxBi() * p.varianceCents * 0.5 * p.variance
            const voiceGain = ctx.createGain()
            voiceGain.gain.value = 1 / (1 + index * 0.6)
            osc.connect(voiceGain)
            voiceGain.connect(lowpass)
            osc.start(now + index * p.spread)
            osc.stop(now + seconds + 0.2)
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

    setParams(next: Partial<AmbientParams>): void {
        this.params = { ...this.params, ...next }
        this.applyParams(false)
    }

    private applyParams(immediate: boolean): void {
        const now = this.ctx.currentTime
        const ramp = immediate ? 0.05 : MIX.paramRamp
        const set = (param: AudioParam, value: number) => {
            param.cancelScheduledValues(now)
            param.setValueAtTime(param.value, now)
            param.linearRampToValueAtTime(value, now + ramp)
        }

        const { depth } = this.params
        set(this.droneFilter.frequency, lerp(DRONE.cutoffLow, DRONE.cutoffHigh, depth))

        const intimacy = intimacyFromDepth(depth)
        set(this.wet.gain, lerp(0.85, 0.18, intimacy))
        set(this.dry.gain, lerp(0.5, 1, intimacy))
    }

    async start(): Promise<void> {
        if (this.disposed || this.running) return
        if (this.ctx.state === 'suspended') await this.ctx.resume()
        this.running = true

        const now = this.ctx.currentTime
        this.fade.gain.cancelScheduledValues(now)
        this.fade.gain.setValueAtTime(this.fade.gain.value, now)
        this.fade.gain.linearRampToValueAtTime(1, now + MIX.fadeIn)

        this.scheduleVoice()
        this.scheduleMetallic()
        this.schedulePiano()
        this.scheduleModulation()
        this.timers.push(window.setTimeout(this.suspendedVoice, 2500))
        // Premier passage dans un patch à volume nul : absorbe la compilation JIT et
        // le premier rendu du convolver SFX, sinon le tout premier tick réel traîne.
        this.timers.push(window.setTimeout(() => this.sfxTick(0.001, 0), 400))

        this.lastFrameTime = 0
        this.lastActivity = performance.now()
        cancelAnimationFrame(this.frame)
        this.frame = requestAnimationFrame(this.tick)
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
    }

    dispose(): void {
        this.stop()
        this.disposed = true
        cancelAnimationFrame(this.frame)
        window.setTimeout(
            () => {
                void this.ctx.close()
            },
            MIX.fadeOut * 1000 + 300,
        )
    }
}

export { clamp01 }
