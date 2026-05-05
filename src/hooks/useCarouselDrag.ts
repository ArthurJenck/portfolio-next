import { useCallback, useEffect, useRef, useState } from 'react'
import { MotionValue, useAnimationControls } from 'framer-motion'
import {
    DRAG_MULTIPLIER,
    IMAGE_INERTIA_SPRING,
    IMAGE_SNAP_TRANSITION,
    IMAGE_SPRING,
    INERTIA_DURATION_MS,
    INERTIA_FACTOR,
    MIN_VELOCITY_FOR_INERTIA,
    TITLE_INERTIA_SPRING,
    TITLE_SNAP_TRANSITION,
    TITLE_SPRING,
} from '../components/projects/config'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value))

interface UseCarouselDragOptions {
    xImages: MotionValue<number>
    imagesCtrl: ReturnType<typeof useAnimationControls>
    titlesCtrl: ReturnType<typeof useAnimationControls>
    dragBounds: { left: number; right: number }
    onDragPositionChange?: (x: number) => void
}

export const useCarouselDrag = ({
    xImages,
    imagesCtrl,
    titlesCtrl,
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

            imagesCtrl.start({
                x: clamped,
                transition: IMAGE_SPRING,
            })

            titlesCtrl.start({
                x: clamped,
                transition: TITLE_SPRING,
            })
        },
        [dragBounds.left, dragBounds.right, imagesCtrl, onDragPositionChange, titlesCtrl, xImages],
    )

    const finishDrag = useCallback(
        (pointerId: number, shouldApplyInertia: boolean) => {
            if (!isDragging || activePointerId.current !== pointerId) return

            activePointerId.current = null
            setIsDragging(false)
            const currentX = xImages.get()

            const velocity = shouldApplyInertia ? velocityX.current : 0
            const targetX = currentX + velocity * INERTIA_DURATION_MS * INERTIA_FACTOR
            const clampedTargetX = clamp(targetX, dragBounds.left, dragBounds.right)

            const hasSignificantVelocity = Math.abs(velocity) > MIN_VELOCITY_FOR_INERTIA

            if (hasSignificantVelocity) {
                xImages.set(clampedTargetX)

                if (onDragPositionChange) {
                    onDragPositionChange(clampedTargetX)
                }

                imagesCtrl.start({
                    x: clampedTargetX,
                    transition: IMAGE_INERTIA_SPRING,
                })
                titlesCtrl.start({
                    x: clampedTargetX,
                    transition: TITLE_INERTIA_SPRING,
                })
            } else {
                if (onDragPositionChange) {
                    onDragPositionChange(currentX)
                }

                imagesCtrl.start({
                    x: currentX,
                    transition: IMAGE_SNAP_TRANSITION,
                })
                titlesCtrl.start({
                    x: currentX,
                    transition: TITLE_SNAP_TRANSITION,
                })
            }
        },
        [dragBounds.left, dragBounds.right, imagesCtrl, isDragging, onDragPositionChange, titlesCtrl, xImages],
    )

    const onPointerDown = (e: React.PointerEvent) => {
        if (activePointerId.current !== null) return

        activePointerId.current = e.pointerId
        setIsDragging(true)
        dragStartX.current = e.clientX

        // Récupérer la position actuelle sans déclencher de synchronisation
        const currentX = xImages.get()
        contentStartX.current = currentX

        lastMoveTime.current = Date.now()
        lastMoveX.current = currentX
        velocityX.current = 0
    }

    const onPointerMove = (e: React.PointerEvent) => {
        if (!isDragging || activePointerId.current !== e.pointerId) return
        updateDragPosition(e.clientX)
    }

    const onPointerUp = (e: React.PointerEvent) => {
        finishDrag(e.pointerId, true)
    }

    const onPointerCancel = (e: React.PointerEvent) => {
        finishDrag(e.pointerId, false)
    }

    useEffect(() => {
        if (!isDragging) return

        const handleWindowPointerMove = (e: PointerEvent) => {
            if (activePointerId.current !== e.pointerId) return
            updateDragPosition(e.clientX)
        }

        const handleWindowPointerUp = (e: PointerEvent) => {
            finishDrag(e.pointerId, true)
        }

        const handleWindowPointerCancel = (e: PointerEvent) => {
            finishDrag(e.pointerId, false)
        }

        window.addEventListener('pointermove', handleWindowPointerMove)
        window.addEventListener('pointerup', handleWindowPointerUp)
        window.addEventListener('pointercancel', handleWindowPointerCancel)

        return () => {
            window.removeEventListener('pointermove', handleWindowPointerMove)
            window.removeEventListener('pointerup', handleWindowPointerUp)
            window.removeEventListener('pointercancel', handleWindowPointerCancel)
        }
    }, [finishDrag, isDragging, updateDragPosition])

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
