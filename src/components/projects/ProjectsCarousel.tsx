'use client'
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import {
    motion,
    useMotionValue,
    useMotionValueEvent,
    useScroll,
    useSpring,
    useTransform,
} from 'framer-motion'
import ProjectTile from './ProjectTile'
import { ProjectDescription } from './ProjectDescription'
import {
    CONTAINER_SCALE_TRANSITION,
    DESCRIPTION_HEIGHT,
    DRAG_SCALE,
    ITEM_GAP,
    ITEM_WIDTH,
    TILE_HEIGHT,
    TITLE_SCALE_TRANSITION,
    TITLE_SPRING,
    TITLE_TOP_OFFSET,
    VIEW_PADDING,
} from './config'
import { useCarouselBounds } from '@/hooks/useCarouselBounds'
import { useCarouselDrag } from '@/hooks/useCarouselDrag'
import { MinimalProjectType } from '@/types/ProjectTypes'
import { Skeleton } from '@/components/skeleton'

interface ProjecsCarouselProps {
    projects: MinimalProjectType[]
    isLoading?: boolean
}

const ProjectsCarousel = ({ projects, isLoading = false }: ProjecsCarouselProps) => {
    const viewportRef = useRef<HTMLDivElement | null>(null)
    const sectionRef = useRef<HTMLElement | null>(null)

    const xImages = useMotionValue(0)
    const xTitles = useSpring(xImages, TITLE_SPRING)

    const [hovered, setHovered] = useState<number | null>(null)
    const [isDraggingOrRecentlyDragged, setIsDraggingOrRecentlyDragged] = useState(false)
    const isMountedRef = useRef(false)
    const dragEndTimeout = useRef<number | null>(null)

    // Créer un tableau factice pour les skeletons
    const skeletonItems = useMemo(() => Array.from({ length: 10 }, (_, i) => ({ id: `skeleton-${i}` })), [])
    const displayItems = isLoading ? skeletonItems : projects

    const contentWidth = useMemo(
        () =>
            (displayItems?.length || 0) * ITEM_WIDTH + ((displayItems?.length || 0) - 1) * ITEM_GAP + VIEW_PADDING * 2,
        [displayItems],
    )

    const { dragBounds } = useCarouselBounds(viewportRef, contentWidth)

    useEffect(() => {
        isMountedRef.current = true
        return () => {
            isMountedRef.current = false
        }
    }, [])

    // Initialiser la cible avant l'abonnement de useScroll évite les warnings
    // de calcul d'offset quand la section n'est pas encore résolue.
    useLayoutEffect(() => {
        sectionRef.current = document.querySelector('#projets')
    }, [])

    const { scrollYProgress } = useScroll({
        target: sectionRef as React.RefObject<HTMLElement>,
        offset: ['start start', 'end end'],
    })

    // Calculer la translation basée sur le scroll
    const scrollX = useTransform(
        scrollYProgress,
        [0, 1],
        [0, dragBounds.left], // De 0 à la limite gauche (négative)
    )

    // Fonction pour calculer la position de scroll correspondant à une position X
    const getScrollPositionFromX = useCallback(
        (x: number) => {
            if (!sectionRef.current) return window.scrollY
            if (dragBounds.left === 0) return sectionRef.current.offsetTop

            const section = sectionRef.current
            const sectionTop = section.offsetTop
            const sectionHeight = section.offsetHeight
            const viewportHeight = window.innerHeight

            // Calculer le ratio de progression (0 à 1), clamped pour éviter les valeurs invalides
            const progress = Math.max(0, Math.min(1, Math.abs(x / dragBounds.left)))

            // Calculer la position de scroll, mais s'assurer qu'on ne dépasse pas
            // la zone où le sticky est actif (sectionHeight - viewportHeight)
            // Cela évite de scroller au-delà de la section
            const maxProgressScroll = sectionHeight - viewportHeight
            const scrollPos = sectionTop + progress * maxProgressScroll

            // S'assurer que la position est dans les limites valides globales
            const maxScroll = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
            return Math.max(sectionTop, Math.min(maxScroll, scrollPos))
        },
        [dragBounds.left],
    )

    useMotionValueEvent(scrollX, 'change', (latest) => {
        if (isDragging || isDraggingOrRecentlyDragged || !isMountedRef.current) return

        xImages.set(latest)
    })

    // Fonction de callback pour synchroniser le scroll avec le drag
    const onDragPositionChange = useCallback(
        (x: number) => {
            const scrollPos = getScrollPositionFromX(x)
            window.scrollTo({
                top: scrollPos,
                behavior: 'instant' as ScrollBehavior,
            })
        },
        [getScrollPositionFromX],
    )

    const { isDragging, handlers } = useCarouselDrag({
        xImages,
        dragBounds,
        onDragPositionChange,
    })

    // Gérer l'état de drag avec un délai après le relâchement
    useEffect(() => {
        if (isDragging) {
            setIsDraggingOrRecentlyDragged(true)
            if (dragEndTimeout.current) {
                window.clearTimeout(dragEndTimeout.current)
                dragEndTimeout.current = null
            }
        } else if (isDraggingOrRecentlyDragged) {
            dragEndTimeout.current = window.setTimeout(() => {
                setIsDraggingOrRecentlyDragged(false)
                dragEndTimeout.current = null
            }, 300)
        }
    }, [isDragging, isDraggingOrRecentlyDragged])

    useEffect(() => {
        return () => {
            if (dragEndTimeout.current) {
                window.clearTimeout(dragEndTimeout.current)
            }
        }
    }, [])

    // Gestion du scroll horizontal (touchpad) - convertir en scroll vertical
    useEffect(() => {
        const section = sectionRef.current
        if (!section) return

        const handleWheel = (e: WheelEvent) => {
            if (isDragging || isDraggingOrRecentlyDragged) {
                return
            }

            if (Math.abs(e.deltaX) > 0) {
                window.scrollBy({
                    top: e.deltaX,
                    behavior: 'instant' as ScrollBehavior,
                })

                e.preventDefault()
            }
        }

        section.addEventListener('wheel', handleWheel, { passive: false })

        return () => {
            section.removeEventListener('wheel', handleWheel)
        }
    }, [isDragging, isDraggingOrRecentlyDragged])

    return (
        <div
            className="relative w-full my-[6vh]"
            style={{
                height: TILE_HEIGHT + TITLE_TOP_OFFSET + DESCRIPTION_HEIGHT,
            }}
        >
            <motion.div
                ref={viewportRef}
                className="absolute inset-0"
                style={{
                    perspective: '1000px',
                    perspectiveOrigin: '50% 30%',
                }}
                animate={{ scale: isDragging ? DRAG_SCALE : 1 }}
                transition={CONTAINER_SCALE_TRANSITION}
            >
                <motion.div
                    className="absolute top-0 left-0 flex items-start cursor-grab active:cursor-grabbing select-none"
                    style={{
                        x: xImages,
                        gap: ITEM_GAP,
                        willChange: 'transform',
                        transformStyle: 'preserve-3d',
                        paddingLeft: VIEW_PADDING,
                        paddingRight: VIEW_PADDING,
                    }}
                    onPointerDown={handlers.onPointerDown}
                    onPointerMove={handlers.onPointerMove}
                    onPointerUp={handlers.onPointerUp}
                    onPointerCancel={handlers.onPointerCancel}
                >
                    {isLoading
                        ? skeletonItems.map((item) => (
                              <Skeleton
                                  key={item.id}
                                  style={{
                                      width: ITEM_WIDTH,
                                      height: TILE_HEIGHT,
                                  }}
                                  className="rounded-lg flex-shrink-0"
                              />
                          ))
                        : projects.map((project, i) => {
                              return (
                                  <ProjectTile
                                      key={project.id}
                                      projectSlug={project.slug}
                                      imageUrl={project.cover_image}
                                      width={ITEM_WIDTH}
                                      height={TILE_HEIGHT}
                                      color={project.color}
                                      onHoverStart={() => setHovered(i)}
                                      onHoverEnd={() => setHovered((s) => (s === i ? null : s))}
                                  />
                              )
                          })}
                </motion.div>
            </motion.div>

            <motion.div
                className="pointer-events-none absolute inset-0"
                animate={{ scale: isDragging ? DRAG_SCALE : 1 }}
                transition={TITLE_SCALE_TRANSITION}
            >
                <motion.div
                    className="absolute left-0 flex items-start"
                    style={{
                        x: xTitles,
                        top: `${TILE_HEIGHT + TITLE_TOP_OFFSET}px`,
                        gap: ITEM_GAP,
                        willChange: 'transform',
                        paddingLeft: VIEW_PADDING,
                        paddingRight: VIEW_PADDING,
                    }}
                >
                    {isLoading
                        ? skeletonItems.map((item) => (
                              <div key={item.id} style={{ width: ITEM_WIDTH }}>
                                  <div className="flex flex-col gap-2">
                                      <Skeleton className="h-7 w-48" />
                                      <Skeleton className="h-6 w-36" />
                                      <div className="mt-4">
                                          <Skeleton className="h-2 w-1/7" />
                                      </div>
                                  </div>
                              </div>
                          ))
                        : projects.map((project, i) => {
                              return (
                                  <ProjectDescription
                                      key={`titles-${project.id}`}
                                      title={project.name}
                                      subtitle={project.subtitle || project.name}
                                      description={project.summary}
                                      date={new Date(project.date)}
                                      tag={project.stack[0].name}
                                      isHovered={hovered === i}
                                      isDragging={isDragging}
                                      width={ITEM_WIDTH}
                                  />
                              )
                          })}
                </motion.div>
            </motion.div>
        </div>
    )
}

export default ProjectsCarousel
