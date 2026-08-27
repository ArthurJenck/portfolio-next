export type AmbientParams = {
    depth: number
    activity: number
}

export type SfxName = 'tick' | 'tileHover' | 'press' | 'release' | 'navInternal' | 'navExternal' | 'like'

export type SfxOptions = {
    pan?: number
    gain?: number
    still?: boolean
}

export type Prng = () => number
