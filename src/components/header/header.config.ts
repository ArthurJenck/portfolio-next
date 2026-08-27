// Distorsion vidéo WebGL du hero (useVideoDistortion).
export const MOUSE_SMOOTHING = 0.12
export const STRENGTH = 0.055
export const ABERRATION = 0.005
export const ENERGY_ATTACK = 0.35
export const ENERGY_DECAY = 0.9
export const IDLE_MS = 60
// Multiplicateur qui convertit le delta de souris par frame en vélocité pour le shader.
export const VELOCITY_SCALE = 10
// Résolution de secours tant que les métadonnées vidéo ne sont pas chargées.
export const FALLBACK_VIDEO_WIDTH = 1920
export const FALLBACK_VIDEO_HEIGHT = 1080
// Un quad plein écran en triangle strip a toujours 4 sommets.
export const QUAD_VERTEX_COUNT = 4

// Lecture vidéo du hero (HeroVid).
// Délai avant .play() sous Safari/iOS : laisse les attributs webkit forcés prendre effet.
export const SAFARI_PLAY_DELAY_MS = 100
