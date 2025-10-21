import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import testImage from '@/assets/images/hero-placeholder.png'

interface AnimeInstance {
    (params: Record<string, unknown>): void
    remove: (targets: unknown) => void
}

declare global {
    interface Window {
        anime?: AnimeInstance
    }
}

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
    const stackRef = useRef<HTMLDivElement>(null)
    const stackItemsRef = useRef<HTMLDivElement[]>([])
    const imgRef = useRef<HTMLImageElement>(null)
    const pointerDownPos = useRef({ x: 0, y: 0 })
    const pointerDownTime = useRef(0)
    const longPressTimer = useRef<number | null>(null)

    useEffect(() => {
        const stackEl = stackRef.current
        if (!stackEl) return

        const stackItems = stackItemsRef.current.filter((el) => el !== null)
        const img = imgRef.current

        if (!stackItems.length || !img) return

        const totalItems = stackItems.length

        const removeAnimeTargets = () => {
            if (typeof window !== 'undefined' && window.anime) {
                const anime = window.anime
                anime.remove(stackItems)
                anime.remove(img)
            }
        }

        const animateIn = () => {
            if (typeof window === 'undefined' || !window.anime) return
            const anime = window.anime

            removeAnimeTargets()

            stackItems.forEach((e, i) => {
                if (e) {
                    e.style.opacity = i !== totalItems - 1 ? String(0.2 * i + 0.2) : '1'
                }
            })

            anime({
                targets: stackItems,
                translateZ: [
                    {
                        value: function (_target: unknown, index: number) {
                            return index * 8 + 8
                        },
                        duration: 200,
                        easing: [0.42, 0, 1, 1],
                    },
                    {
                        value: function (_target: unknown, index: number) {
                            return index * 20 + 20
                        },
                        duration: 700,
                        easing: [0.2, 1, 0.3, 1],
                    },
                ],
                rotateX: [
                    {
                        value: function (_target: unknown, index: number) {
                            return -1 * (index * 2 + 2)
                        },
                        duration: 200,
                        easing: [0.42, 0, 1, 1],
                    },
                    {
                        value: 0,
                        duration: 700,
                        easing: [0.2, 1, 0.3, 1],
                    },
                ],
            })

            anime({
                targets: img,
                duration: 900,
                easing: [0.2, 1, 0.3, 1],
                scale: 0.7,
            })
        }

        const animateOut = () => {
            if (typeof window === 'undefined' || !window.anime) return
            const anime = window.anime

            removeAnimeTargets()

            anime({
                targets: stackItems,
                translateZ: [
                    {
                        value: function (_target: unknown, index: number) {
                            return index * 20 + 20 - 8
                        },
                        duration: 200,
                        easing: [0.42, 0, 1, 1],
                    },
                    {
                        value: 0,
                        duration: 900,
                        easing: [0.2, 1, 0.3, 1],
                    },
                ],
                rotateX: [
                    {
                        value: function (_target: unknown, index: number) {
                            return index * 2 + 2
                        },
                        duration: 200,
                        easing: [0.42, 0, 1, 1],
                    },
                    {
                        value: 0,
                        duration: 900,
                        easing: [0.2, 1, 0.3, 1],
                    },
                ],
            })

            anime({
                targets: img,
                duration: 900,
                easing: [0.2, 1, 0.3, 1],
                scale: 1,
            })
        }

        const onMouseEnter = () => animateIn()
        const onMouseLeave = () => animateOut()

        stackEl.addEventListener('mouseenter', onMouseEnter)
        stackEl.addEventListener('mouseleave', onMouseLeave)

        return () => {
            stackEl.removeEventListener('mouseenter', onMouseEnter)
            stackEl.removeEventListener('mouseleave', onMouseLeave)
            removeAnimeTargets()
        }
    }, [])

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

        if (totalMovement < 5 && holdDuration < 100) {
            router.push(`/project/${projectSlug}`)
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
                    {/* Tenter avec images 560*314 */}
                    <Image
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                        ref={imgRef}
                        className="relative block flex-none max-w-none w-auto h-auto select-none pointer-events-none"
                        src={testImage}
                        alt="Image"
                        width={1920}
                        height={1080}
                    />
                </div>
            </div>
        </div>
    )
}

export default ProjectTile
