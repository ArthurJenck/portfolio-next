// Confettis émis à chaque like : nombre, angle, distance et rotation aléatoires.
export const PARTICLE_COUNT = 6
export const PARTICLE_ANGLE_MAX_DEG = 360
export const PARTICLE_DISTANCE_MIN = 22
export const PARTICLE_DISTANCE_RANGE = 18
export const PARTICLE_ROTATE_RANGE = 90
export const PARTICLE_ROTATE_CENTER = 45

export const DEGREES_PER_HALF_TURN = 180

// Rebond du cœur au clic : dépasse 1, revient sous 1, se stabilise légèrement au-dessus.
// Pas de "as const" : framer-motion attend un tableau mutable pour ses keyframes.
export const PULSE_SCALE_KEYFRAMES: number[] = [1, 1.4, 0.9, 1.15, 1]
