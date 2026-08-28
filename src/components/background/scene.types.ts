import type { PerspectiveCamera, Scene } from 'three'

export type SceneContext = {
    scene: Scene
    camera: PerspectiveCamera
    isMobile: boolean
}

export type FrameState = {
    // Progression du scroll de la page, lissée, entre 0 et 1.
    progress: number
    // Nombre d'écrans déjà scrollés, lissé. Permet de caler une séquence sur une hauteur
    // fixe en svh — ici l'entrée dans le tunnel — sans dépendre de la longueur de la page.
    viewports: number
    // Nombre total d'écrans scrollables. Sert à convertir une position en svh vers la
    // progression normalisée correspondante.
    viewportsTotal: number
    // Temps écoulé depuis la frame précédente, en secondes, borné.
    delta: number
    // Pointeur amorti, entre -1 et 1 sur chaque axe. Reste à 0 au tactile et sous
    // prefers-reduced-motion : c'est à la scène d'en faire ce qu'elle veut, le socle
    // ne touche jamais la caméra lui-même.
    pointerX: number
    pointerY: number
}

export type SceneController = {
    update: (frame: FrameState) => void
    dispose: () => void
}

export type SceneFactory = (context: SceneContext) => SceneController
