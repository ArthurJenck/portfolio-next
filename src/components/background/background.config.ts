// Réglages communs à toutes les variantes de fond 3D. Ce qui est propre à une scène donnée
// vit dans scene.config.ts, le seul fichier qui change d'une variante à l'autre.

export const CAMERA_NEAR = 0.1
export const CAMERA_FAR = 200
export const BASE_FOV = 45
// En portrait, le fov est élargi pour compenser un viewport étroit et garder la scène dans
// le cadre — plafonné, sinon la perspective part en grand-angle.
export const MAX_FOV = 70
export const BASE_ASPECT = 16 / 9

// Constante de temps du lissage du scroll, en secondes.
export const SCROLL_TAU = 0.12
// Idem pour la dérive au pointeur : nettement plus lente, le mouvement doit être ressenti
// sans jamais être suivi du regard.
export const POINTER_TAU = 0.45
// Amplitude maximale de la dérive, en radians (~1,7°).
export const POINTER_MAX_RAD = 0.03

// Plafond de framerate sur mobile.
export const MOBILE_FRAME_MS = 1000 / 30
// Borne le delta-time : sans ça, un onglet réveillé ferait sauter la scène d'un bloc.
export const MAX_DELTA_S = 0.05

export const DPR_CAP = 2
// Court, parce que la séquence d'entrée de la scène démarre peu après l'armement : un
// fondu long mangerait le début de l'animation au lieu de la préparer.
export const FADE_IN_MS = 400

export const MS_PER_SECOND = 1000
export const DEG_TO_RAD = Math.PI / 180
export const RAD_TO_DEG = 180 / Math.PI

// La scène s'arme au premier pixel de scroll. Le hero défile tandis que le canvas est
// fixe : une bande de scène se découvre par le bas immédiatement, et la séquence d'entrée
// doit suivre le scroll dès cet instant. S'armer plus tard donnait une scène figée qui
// démarrait d'un coup, à mi-course, une fois le hero à moitié sorti.
//
// Rien ne tourne tant qu'on n'a pas scrollé : l'IntersectionObserver démarre la boucle
// quand la sentinelle passe au-dessus du viewport. Classe littérale pour rester détectable
// par Tailwind.
export const START_SENTINEL_CLASS = 'absolute top-[2svh] left-0 h-px w-px pointer-events-none'

// La dérive au pointeur n'a de sens qu'avec une souris : au doigt elle ne se déclenche
// qu'aux taps, ce qui produit des sursauts.
export const POINTER_QUERY = '(hover: hover) and (pointer: fine)'

// Chargement du chunk three différé à l'inactivité, pour ne pas concurrencer le LCP du hero.
export const IDLE_TIMEOUT_MS = 2000
export const IDLE_FALLBACK_MS = 1200
