// Résolution de la vague dessinée dans le bouton, et fenêtre de lissage de la
// compensation de latence de sortie (voir SoundToggle).
export const POINTS = 40
export const HISTORY_MS = 600

// Réactivité de l'amplitude affichée à l'analyseur audio.
export const SENSITIVITY = 2.6
export const SMOOTHING = 0.07
export const RMS_GAIN = 3
export const RMS_CURVE_EXPONENT = 0.5

// Clamp du delta-temps entre frames, et valeur de repli avant la première mesure.
export const MS_PER_SECOND = 1000
export const MAX_DT_SECONDS = 0.1
export const DEFAULT_DT_SECONDS = 0.016

// Vitesse de la vague : ralentie en reduced-motion, sinon modulée par l'amplitude.
export const REDUCED_MOTION_SPEED = 0.35
export const PHASE_BASE_SPEED = 0.5
export const PHASE_AMPLITUDE_GAIN = 2.6
export const PHASE_SPEED_SCALE = 3.6
export const WAVE_FREQUENCY = 7.2
