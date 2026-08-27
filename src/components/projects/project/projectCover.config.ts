// Plages de progression du slider utilisées pour interpoler les effets visuels
// de la cover pendant le défilement (flou, luminosité, saturation, voile).
// Pas de "as const" : useTransform de framer-motion attend des tableaux mutables.
export const VISUAL_EFFECT_PROGRESS_RANGE: number[] = [0.25, 1]
export const OVERLAY_PROGRESS_RANGE: number[] = [0, 1]

export const BLUR_RANGE: number[] = [0, 5]
export const BRIGHTNESS_RANGE: number[] = [1, 0.68]
export const SATURATION_RANGE: number[] = [1, 0.84]
export const OVERLAY_OPACITY_RANGE: number[] = [0.1, 0.3]
