import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, MotionValue } from 'framer-motion'
import {
    DRAG_MULTIPLIER,
    IMAGE_INERTIA_SPRING,
    INERTIA_DURATION_MS,
    INERTIA_FACTOR,
    MIN_VELOCITY_FOR_INERTIA,
} from '../components/projects/projects.config'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

interface UseCarouselDragOptions {
    xImages: MotionValue<number>
    dragBounds: { left: number; right: number }
    onDragPositionChange?: (x: number) => void
}

export const useCarouselDrag = ({
    xImages,
    dragBounds,
    onDragPositionChange,
}: UseCarouselDragOptions) => {
    const [isDragging, setIsDragging] = useState(false)

    const dragStartX = useRef(0)
    const contentStartX = useRef(0)
    const activePointerId = useRef<number | null>(null)

    const lastMoveTime = useRef<number>(0)
    const lastMoveX = useRef<number>(0)
    const velocityX = useRef<number>(0)
    const xAnimation = useRef<ReturnType<typeof animate> | null>(null)
    const windowListeners = useRef<{
        move: (e: PointerEvent) => void
        up: (e: PointerEvent) => void
        cancel: (e: PointerEvent) => void
    } | null>(null)

    const clearWindowListeners = useCallback(() => {
        if (!windowListeners.current) return

        window.removeEventListener('pointermove', windowListeners.current.move)
        window.removeEventListener('pointerup', windowListeners.current.up)
        window.removeEventListener('pointercancel', windowListeners.current.cancel)
        windowListeners.current = null
    }, [])

    const updateDragPosition = useCallback(
        (clientX: number) => {
            if (activePointerId.current === null) return

            const deltaX = (clientX - dragStartX.current) * DRAG_MULTIPLIER
            const newX = contentStartX.current + deltaX
            const clamped = clamp(newX, dragBounds.left, dragBounds.right)

            const now = Date.now()
            const timeDelta = now - lastMoveTime.current
            if (timeDelta > 0) {
                const positionDelta = clamped - lastMoveX.current
                velocityX.current = positionDelta / timeDelta
                lastMoveTime.current = now
                lastMoveX.current = clamped
            }

            xImages.set(clamped)

            if (onDragPositionChange) {
                onDragPositionChange(clamped)
            }
        },
        [dragBounds.left, dragBounds.right, onDragPositionChange, xImages],
    )

    const finishDrag = useCallback(
        (pointerId: number, shouldApplyInertia: boolean) => {
            if (!isDragging || activePointerId.current !== pointerId) return

            clearWindowListeners()
            activePointerId.current = null
            setIsDragging(false)
            const currentX = xImages.get()

            const velocity = shouldApplyInertia ? velocityX.current : 0
            const targetX = currentX + velocity * INERTIA_DURATION_MS * INERTIA_FACTOR
            const clampedTargetX = clamp(targetX, dragBounds.left, dragBounds.right)

            const hasSignificantVelocity = Math.abs(velocity) > MIN_VELOCITY_FOR_INERTIA

            if (hasSignificantVelocity) {
                if (onDragPositionChange) {
                    onDragPositionChange(clampedTargetX)
                }

                xAnimation.current?.stop()
                xAnimation.current = animate(xImages, clampedTargetX, IMAGE_INERTIA_SPRING)
            } else {
                if (onDragPositionChange) {
                    onDragPositionChange(currentX)
                }
            }
        },
        [clearWindowListeners, dragBounds.left, dragBounds.right, isDragging, onDragPositionChange, xImages],
    )

    const onPointerDown = (e: React.PointerEvent) => {
        if (activePointerId.current !== null) return

        xAnimation.current?.stop()
        clearWindowListeners()
        activePointerId.current = e.pointerId
        setIsDragging(true)
        dragStartX.current = e.clientX

        // Récupérer la position actuelle sans déclencher de synchronisation
        const currentX = xImages.get()
        contentStartX.current = currentX

        lastMoveTime.current = Date.now()
        lastMoveX.current = currentX
        velocityX.current = 0

        const handleWindowPointerMove = (event: PointerEvent) => {
            if (activePointerId.current !== event.pointerId) return
            updateDragPosition(event.clientX)
        }

        const handleWindowPointerUp = (event: PointerEvent) => {
            finishDrag(event.pointerId, true)
        }

        const handleWindowPointerCancel = (event: PointerEvent) => {
            finishDrag(event.pointerId, false)
        }

        window.addEventListener('pointermove', handleWindowPointerMove)
        window.addEventListener('pointerup', handleWindowPointerUp)
        window.addEventListener('pointercancel', handleWindowPointerCancel)

        windowListeners.current = {
            move: handleWindowPointerMove,
            up: handleWindowPointerUp,
            cancel: handleWindowPointerCancel,
        }
    }

    const onPointerMove = () => {}

    const onPointerUp = (e: React.PointerEvent) => {
        finishDrag(e.pointerId, true)
    }

    const onPointerCancel = (e: React.PointerEvent) => {
        finishDrag(e.pointerId, false)
    }

    useEffect(() => {
        return () => {
            xAnimation.current?.stop()
            clearWindowListeners()
        }
    }, [clearWindowListeners])

    // Le wheel scroll n'est plus géré ici, c'est le scroll naturel
    // de la page qui est transformé en mouvement horizontal via le pinning

    return {
        isDragging,
        handlers: {
            onPointerDown,
            onPointerMove,
            onPointerUp,
            onPointerCancel,
        },
    }
}
