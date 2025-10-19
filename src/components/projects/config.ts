export const ITEM_WIDTH = 504
export const ITEM_GAP = 80
export const VIEW_PADDING = 300
export const TILE_HEIGHT = 283

export const SUBTITLE_UNDERLINE_W = 25

export const TITLE_START_DELAY_MS = 15

export const TITLE_TOP_OFFSET = 32

export const DESCRIPTION_HEIGHT = 200

export const IMAGE_SPRING = {
    type: 'spring',
    stiffness: 400,
    damping: 35,
    mass: 0.3,
} as const

export const TITLE_SPRING = {
    type: 'spring',
    stiffness: 200,
    damping: 40,
    mass: 1.2,
} as const

export const IMAGE_SNAP_MS = 250
export const TITLE_SNAP_MS = 280

export const IMAGE_EASE = [0.16, 1, 0.3, 1] as const
export const TITLE_EASE = [0.25, 0.46, 0.45, 0.94] as const

export const IMAGE_SNAP_TRANSITION = {
    type: 'tween',
    duration: IMAGE_SNAP_MS / 1000,
    ease: IMAGE_EASE,
} as const

export const TITLE_SNAP_TRANSITION = {
    type: 'tween',
    duration: TITLE_SNAP_MS / 1000,
    ease: TITLE_EASE,
} as const

export const DRAG_SCALE = 0.9
export const WHEEL_SENSITIVITY = 1
export const DRAG_MULTIPLIER = 2
export const MIN_VELOCITY_FOR_INERTIA = 0.1

export const INERTIA_FACTOR = 0.8
export const INERTIA_DURATION_MS = 300

export const IMAGE_INERTIA_SPRING = {
    type: 'spring',
    stiffness: 150,
    damping: 25,
    mass: 1,
} as const

export const TITLE_INERTIA_SPRING = {
    type: 'spring',
    stiffness: 130,
    damping: 28,
    mass: 1.2,
} as const

export const WHEEL_SNAP_DELAY_MS = 15

export const CONTAINER_HEIGHT = '750px'
export const CONTAINER_SCALE_TRANSITION = {
    type: 'tween',
    duration: 0.8,
} as const

export const TITLE_SCALE_TRANSITION = {
    scale: { duration: 1 },
    type: 'tween',
    ease: 'easeInOut',
} as const

export const DESCRIPTION_OPACITY_TRANSITION = {
    duration: '500ms',
    delay: '50ms',
} as const

export const TAGS_OPACITY_TRANSITION = {
    duration: '500ms',
    delay: '130ms',
} as const

export const DESCRIPTION_TRANSLATE_Y = 24
