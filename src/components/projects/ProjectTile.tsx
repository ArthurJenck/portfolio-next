'use client'

import { gsap } from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

gsap.registerPlugin(CustomEase)
CustomEase.create('tileIn', 'M0,0 C0.42,0,1,1,1,1')
CustomEase.create('tileOut', 'M0,0 C0.2,1,0.3,1,1,1')

const IMAGE_REST_SCALE = 1.35
const IMAGE_HOVER_SCALE = 1

interface ProjectTileProps {
    width: number
    height: number
    color?: string
    imageUrl: string
    projectSlug: string
    onHoverStart?: () => void
    onHoverEnd?: () => void
}

const ProjectTile: React.FC<ProjectTileProps> = ({
    width,
    height,
    color = '#ffffff',
    imageUrl,
    projectSlug,
    onHoverStart,
    onHoverEnd,
}) => {
    const router = useRouter()
    const prefersReducedMotion = usePrefersReducedMotion()
    const stackRef = useRef<HTMLDivElement>(null)
    const stackItemsRef = useRef<HTMLDivElement[]>([])
    const imgRef = useRef<HTMLImageElement>(null)
    const pointerDownPos = useRef({ x: 0, y: 0 })
    const pointerDownTime = useRef(0)
    const longPressTimer = useRef<number | null>(null)
    const hasPrefetched = useRef(false)

    useEffect(() => {
        const stackEl = stackRef.current
        if (!stackEl) return

        const stackItems = stackItemsRef.current.filter((el) => el !== null)
        const img = imgRef.current

        if (!stackItems.length || !img) return

        const totalItems = stackItems.length

        const killTweens = () => {
            gsap.killTweensOf(stackItems)
            gsap.killTweensOf(img)
        }

        // En reduced-motion, on garde le prefetch au hover mais on coupe
        // entièrement les animations 3D décoratives (stack qui se déploie).
        if (prefersReducedMotion) {
            const onMouseEnterReduced = () => {
                if (!hasPrefetched.current) {
                    router.prefetch(`/${projectSlug}`)
                    hasPrefetched.current = true
                }
            }
            stackEl.addEventListener('mouseenter', onMouseEnterReduced)
            return () => {
                stackEl.removeEventListener('mouseenter', onMouseEnterReduced)
            }
        }

        const animateIn = () => {
            killTweens()

            stackItems.forEach((e, i) => {
                if (e) {
                    e.style.opacity = i !== totalItems - 1 ? String(0.2 * i + 0.2) : '1'
                }
            })

            gsap.to(stackItems, {
                keyframes: [
                    {
                        z: (index: number) => index * 8 + 8,
                        rotationX: (index: number) => -1 * (index * 2 + 2),
                        duration: 0.2,
                        ease: 'tileIn',
                    },
                    {
                        z: (index: number) => index * 20 + 20,
                        rotationX: 0,
                        duration: 0.7,
                        ease: 'tileOut',
                    },
                ],
            })

            gsap.to(img, {
                duration: 0.9,
                ease: 'tileOut',
                scale: IMAGE_HOVER_SCALE,
            })
        }

        const animateOut = () => {
            killTweens()

            gsap.to(stackItems, {
                keyframes: [
                    {
                        z: (index: number) => index * 20 + 20 - 8,
                        rotationX: (index: number) => index * 2 + 2,
                        duration: 0.2,
                        ease: 'tileIn',
                    },
                    {
                        z: 0,
                        rotationX: 0,
                        duration: 0.9,
                        ease: 'tileOut',
                    },
                ],
            })

            gsap.to(img, {
                duration: 0.9,
                ease: 'tileOut',
                scale: IMAGE_REST_SCALE,
            })
        }

        const onMouseEnter = () => {
            animateIn()
            if (!hasPrefetched.current) {
                router.prefetch(`/${projectSlug}`)
                hasPrefetched.current = true
            }
        }
        const onMouseLeave = () => animateOut()

        stackEl.addEventListener('mouseenter', onMouseEnter)
        stackEl.addEventListener('mouseleave', onMouseLeave)

        return () => {
            stackEl.removeEventListener('mouseenter', onMouseEnter)
            stackEl.removeEventListener('mouseleave', onMouseLeave)
            killTweens()
        }
    }, [projectSlug, router, prefersReducedMotion])

    const handlePointerDown = (e: React.PointerEvent) => {
        pointerDownPos.current = { x: e.clientX, y: e.clientY }
        pointerDownTime.current = Date.now()

        if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current)
        }

        longPressTimer.current = window.setTimeout(() => {
            pointerDownTime.current = -1
        }, 300)
    }

    const handlePointerUp = (e: React.PointerEvent) => {
        if (longPressTimer.current) {
            window.clearTimeout(longPressTimer.current)
            longPressTimer.current = null
        }

        if (pointerDownTime.current === -1) return

        const deltaX = Math.abs(e.clientX - pointerDownPos.current.x)
        const deltaY = Math.abs(e.clientY - pointerDownPos.current.y)
        const totalMovement = Math.sqrt(deltaX * deltaX + deltaY * deltaY)
        const holdDuration = Date.now() - pointerDownTime.current

        if (totalMovement < 10 && holdDuration < 300) {
            router.push(`/${projectSlug}`)
        }
    }

    return (
        <div
            className="relative block flex-none cursor-pointer no-underline outline-none"
            style={{ transformStyle: 'preserve-3d', width }}
            onMouseEnter={onHoverStart}
            onMouseLeave={onHoverEnd}
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
        >
            <div ref={stackRef} className="relative w-full" style={{ transformStyle: 'preserve-3d', height }}>
                <div
                    ref={(el) => {
                        if (el) stackItemsRef.current[0] = el
                    }}
                    className="absolute inset-0 w-full h-full origin-bottom opacity-20"
                    style={{ backgroundColor: color }}
                ></div>
                <div
                    ref={(el) => {
                        if (el) stackItemsRef.current[1] = el
                    }}
                    className="absolute inset-0 w-full h-full origin-bottom opacity-40"
                    style={{ backgroundColor: color }}
                ></div>
                <div
                    ref={(el) => {
                        if (el) stackItemsRef.current[2] = el
                    }}
                    className="absolute inset-0 w-full h-full origin-bottom opacity-60"
                    style={{ backgroundColor: color }}
                ></div>
                <div
                    ref={(el) => {
                        if (el) stackItemsRef.current[3] = el
                    }}
                    className="absolute inset-0 w-full h-full origin-bottom opacity-80"
                    style={{ backgroundColor: color }}
                ></div>
                <div
                    ref={(el) => {
                        if (el) stackItemsRef.current[4] = el
                    }}
                    className="relative flex justify-center items-center overflow-hidden w-full h-full cursor-pointer origin-bottom"
                    style={{ backgroundColor: color }}
                >
                    <Image
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        ref={imgRef}
                        className="select-none pointer-events-none object-cover will-change-transform"
                        src={imageUrl}
                        alt="Image"
                        fill
                        sizes={`${width}px`}
                        style={{
                            transform: `scale(${IMAGE_REST_SCALE})`,
                            transformOrigin: 'center center',
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

export default ProjectTile
