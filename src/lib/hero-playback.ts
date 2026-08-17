export const HERO_PLAY_CLASS = 'hero-play'
export const HERO_PLAY_EVENT = 'hero-play'

export const isHeroPlayReleased = (): boolean =>
    typeof document !== 'undefined' && document.documentElement.classList.contains(HERO_PLAY_CLASS)

export const releaseHeroPlay = (): void => {
    if (typeof document === 'undefined') return
    if (isHeroPlayReleased()) return
    document.documentElement.classList.add(HERO_PLAY_CLASS)
    window.dispatchEvent(new CustomEvent(HERO_PLAY_EVENT))
}

export const onHeroPlay = (callback: () => void): (() => void) => {
    if (isHeroPlayReleased()) {
        callback()
        return () => {}
    }
    window.addEventListener(HERO_PLAY_EVENT, callback, { once: true })
    return () => window.removeEventListener(HERO_PLAY_EVENT, callback)
}
