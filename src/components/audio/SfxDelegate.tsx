'use client'

import { useEffect } from 'react'
import { useAmbientAudio } from '@/providers/ambient-audio-context'
import type { SfxName } from '@/lib/audio/audio.types'
import { panFromHorizontalPosition } from '@/lib/utils'

type Role = 'link' | 'link-ext' | 'button' | 'tile' | 'like'

const HOVER: Record<Role, SfxName> = {
    link: 'tick',
    'link-ext': 'tick',
    button: 'tick',
    tile: 'tileHover',
    like: 'tick',
}

// Le like n'a pas de press/release : son propre son est déjà le retour du geste, un
// impact avant lui ne ferait que le brouiller.
const ACTIVATE: Partial<Record<Role, SfxName>> = {
    link: 'navInternal',
    'link-ext': 'navExternal',
    like: 'like',
}

const HOVER_COOLDOWN_MS = 60
const BUTTON_HOVER_GAIN = 0.7

const marked = (node: EventTarget | null): Element | null =>
    node instanceof Element ? node.closest('[data-sfx]') : null

// Une valeur inconnue rend l'élément muet plutôt que de casser quoi que ce soit :
// c'est ce qui compense l'absence de vérification statique sur un data-attribute.
const roleOf = (element: Element | null): Role | null => {
    const value = element?.getAttribute('data-sfx')
    return value === 'link' ||
        value === 'link-ext' ||
        value === 'button' ||
        value === 'tile' ||
        value === 'like'
        ? value
        : null
}

const panOf = (element: Element): number => {
    const box = element.getBoundingClientRect()
    return panFromHorizontalPosition(box.left + box.width / 2, window.innerWidth)
}

const SfxDelegate = () => {
    const { enabled, playSfx } = useAmbientAudio()

    useEffect(() => {
        if (!enabled) return

        let pressed: Element | null = null
        let hovered: Element | null = null
        let lastHover = 0

        const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches

        const onOver = (event: PointerEvent) => {
            // Le tactile émet un pointerover synthétique avant le pointerdown : sans ce
            // filtre, chaque tap produirait tick + press + release.
            if (event.pointerType !== 'mouse') return
            const element = marked(event.target)
            // pointerover rebondit du parent vers l'enfant, et une animation qui remonte
            // un nœud sous le curseur en émet un sans que la souris ait bougé. Mémoriser
            // l'élément résolu couvre les deux cas ; relatedTarget ne couvre que le
            // premier et n'est pas fiable après un remontage.
            if (element === hovered) return
            hovered = element
            if (!element) return
            const role = roleOf(element)
            if (!role) return
            if (event.timeStamp - lastHover < HOVER_COOLDOWN_MS) return
            lastHover = event.timeStamp
            playSfx(HOVER[role], {
                pan: panOf(element),
                gain: role === 'button' ? BUTTON_HOVER_GAIN : 1,
            })
        }

        const onDown = (event: PointerEvent) => {
            pressed = marked(event.target)
            if (!pressed || roleOf(pressed) !== 'button') return
            playSfx('press', { pan: panOf(pressed) })
        }

        const onUp = (event: PointerEvent) => {
            const element = marked(event.target)
            const was = pressed
            pressed = null
            // Relâcher ailleurs = geste annulé, comme sur un vrai bouton.
            if (!element || element !== was || roleOf(element) !== 'button') return
            playSfx('release', { pan: panOf(element) })
        }

        const onCancel = () => {
            pressed = null
        }

        // click et non pointerup : il ne part qu'après une activation réelle et couvre
        // Entrée au clavier sur un lien.
        const onClick = (event: MouseEvent) => {
            const element = marked(event.target)
            const role = roleOf(element)
            const name = role ? ACTIVATE[role] : undefined
            if (!name || !element) return
            playSfx(name, { pan: panOf(element), still })
        }

        const options = { passive: true } as const
        // click et pointerup sont écoutés en CAPTURE. En bulle, React a déjà traité
        // l'événement et re-rendu quand ils nous parviennent : un composant qui remonte
        // un nœud pendant son handler (une `key` qui change pour rejouer une animation,
        // comme le cœur du bouton like) laisse event.target détaché du document, et
        // closest() remonte alors un arbre orphelin sans jamais trouver [data-sfx].
        // En capture, document voit l'événement avant React, l'arbre est intact.
        const capture = { passive: true, capture: true } as const
        document.addEventListener('pointerover', onOver, options)
        document.addEventListener('pointerdown', onDown, options)
        document.addEventListener('pointerup', onUp, capture)
        document.addEventListener('pointercancel', onCancel, options)
        document.addEventListener('click', onClick, capture)

        return () => {
            document.removeEventListener('pointerover', onOver)
            document.removeEventListener('pointerdown', onDown)
            document.removeEventListener('pointerup', onUp, capture)
            document.removeEventListener('pointercancel', onCancel)
            document.removeEventListener('click', onClick, capture)
        }
    }, [enabled, playSfx])

    return null
}

export default SfxDelegate
