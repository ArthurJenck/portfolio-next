// Constantes pures de la détection de tonalité (exécutée à l'upload d'un morceau
// dans l'admin). Même convention que audio.config.ts : aucune fonction ici.

export const PITCH_CLASSES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

export const REFERENCE_A4_HZ = 440
export const REFERENCE_A4_MIDI = 69

// BASE_HZ du moteur (146.83 Hz) est un Ré2 : rootOffset = 0 correspond à la classe D.
export const ROOT_PITCH_CLASS_INDEX = 2

export const ANALYSIS_SAMPLE_RATE = 11025
export const FRAME_SIZE = 4096
export const OCTAVES = [2, 3, 4, 5, 6]
export const SEGMENT_START_RATIO = 0.25
export const SEGMENT_SPAN_RATIO = 0.5
export const MAX_ANALYSIS_SECONDS = 60

// Profils de tonalité de Krumhansl-Kessler, indexés à partir de la tonique.
export const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
export const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]
