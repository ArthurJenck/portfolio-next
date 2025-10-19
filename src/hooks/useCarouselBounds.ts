import { useLayoutEffect, useState, RefObject } from 'react'

export const useCarouselBounds = (viewportRef: RefObject<HTMLDivElement | null>, contentWidth: number) => {
    const [dragBounds, setDragBounds] = useState({ left: 0, right: 0 })

    useLayoutEffect(() => {
        const el = viewportRef.current
        if (!el) return
        const vw = el.clientWidth
        const total = contentWidth
        const maxScroll = Math.max(0, total - vw)
        setDragBounds({ left: -maxScroll, right: 0 })
    }, [contentWidth, viewportRef])

    return { dragBounds }
}
