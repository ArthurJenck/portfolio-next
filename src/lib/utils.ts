import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .normalize('NFD') // Normalise les caractères accentués
        .replace(/[\u0300-\u036f]/g, '') // Supprime les accents
        .replace(/[^a-z0-9]+/g, '-') // Remplace les caractères spéciaux par des tirets
        .replace(/^-+|-+$/g, '') // Supprime les tirets en début/fin
}

export function normalizeColor(color: string): string {
    if (!color) return '#f0f0f0'
    const trimmedColor = color.trim()
    if (trimmedColor.startsWith('#')) return trimmedColor
    return `#${trimmedColor}`
}

const PAN_SCALE = 1.4
const PAN_OFFSET = 0.7

// Convertit une position horizontale (px) en valeur de panoramique stéréo (-0.7 à 0.7).
// Partagé par SfxDelegate (survol/clic génériques) et ProjectTile (son propre au drag).
export function panFromHorizontalPosition(x: number, viewportWidth: number): number {
    return (x / viewportWidth) * PAN_SCALE - PAN_OFFSET
}
