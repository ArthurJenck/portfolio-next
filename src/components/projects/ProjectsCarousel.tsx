"use client"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  motion,
  useAnimationControls,
  useMotionValue,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion"
import { useProjects } from "@/hooks/useProjects"
import ProjectTile from "./ProjectTile"
import { ProjectDescription } from "./ProjectDescription"
import {
  CONTAINER_SCALE_TRANSITION,
  DESCRIPTION_HEIGHT,
  DRAG_SCALE,
  ITEM_GAP,
  ITEM_WIDTH,
  TILE_HEIGHT,
  TITLE_SCALE_TRANSITION,
  TITLE_TOP_OFFSET,
  VIEW_PADDING,
} from "./config"
import { useCarouselBounds } from "@/hooks/useCarouselBounds"
import { useCarouselDrag } from "@/hooks/useCarouselDrag"

export const ProjectsCarousel: React.FC = () => {
  const { data: projects, isLoading, error } = useProjects()
  const viewportRef = useRef<HTMLDivElement | null>(null)
  const sectionRef = useRef<HTMLElement | null>(null)

  const xImages = useMotionValue(0)
  const imagesCtrl = useAnimationControls()
  const titlesCtrl = useAnimationControls()

  const [hovered, setHovered] = useState<number | null>(null)
  const [isDraggingOrRecentlyDragged, setIsDraggingOrRecentlyDragged] =
    useState(false)
  const dragEndTimeout = useRef<number | null>(null)

  const contentWidth = useMemo(
    () =>
      (projects?.length || 0) * ITEM_WIDTH +
      ((projects?.length || 0) - 1) * ITEM_GAP +
      VIEW_PADDING * 2,
    [projects]
  )

  const { dragBounds } = useCarouselBounds(viewportRef, contentWidth)

  // Scroll-based animation : écouter le scroll de la section
  useEffect(() => {
    sectionRef.current = document.querySelector("#projets")
  }, [])

  const { scrollYProgress } = useScroll({
    target: sectionRef as React.RefObject<HTMLElement>,
    offset: ["start start", "end end"],
  })

  // Calculer la translation basée sur le scroll
  const scrollX = useTransform(
    scrollYProgress,
    [0, 1],
    [0, dragBounds.left] // De 0 à la limite gauche (négative)
  )

  // Fonction pour calculer la position de scroll correspondant à une position X
  const getScrollPositionFromX = useCallback(
    (x: number) => {
      if (!sectionRef.current) return window.scrollY

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
      const maxScroll = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      )
      return Math.max(sectionTop, Math.min(maxScroll, scrollPos))
    },
    [dragBounds.left]
  )

  // Synchroniser la position avec le scroll (sauf si on drag)
  useMotionValueEvent(scrollX, "change", (latest) => {
    if (!isDraggingOrRecentlyDragged) {
      // Utiliser .set() pour une mise à jour instantanée sans animation
      xImages.set(latest)
      imagesCtrl.set({ x: latest })
      titlesCtrl.set({ x: latest })
    }
  })

  // Fonction de callback pour synchroniser le scroll avec le drag
  const onDragPositionChange = useCallback(
    (x: number) => {
      const scrollPos = getScrollPositionFromX(x)
      window.scrollTo({
        top: scrollPos,
        behavior: "instant" as ScrollBehavior,
      })
    },
    [getScrollPositionFromX]
  )

  const { isDragging, handlers } = useCarouselDrag({
    xImages,
    imagesCtrl,
    titlesCtrl,
    dragBounds,
    viewportRef,
    onDragPositionChange,
  })

  // Gérer l'état de drag avec un délai après le relâchement
  useEffect(() => {
    if (isDragging) {
      setIsDraggingOrRecentlyDragged(true)
      if (dragEndTimeout.current) {
        window.clearTimeout(dragEndTimeout.current)
      }
    } else if (isDraggingOrRecentlyDragged) {
      // Attendre un peu après le drag avant de re-synchroniser avec le scroll
      // Pendant ce temps, la position restera stable
      dragEndTimeout.current = window.setTimeout(() => {
        setIsDraggingOrRecentlyDragged(false)

        // Forcer une dernière synchronisation pour être sûr que tout est aligné
        const currentScrollX = scrollX.get()
        xImages.set(currentScrollX)
        imagesCtrl.set({ x: currentScrollX })
        titlesCtrl.set({ x: currentScrollX })
      }, 300)
    }
  }, [
    isDragging,
    isDraggingOrRecentlyDragged,
    scrollX,
    xImages,
    imagesCtrl,
    titlesCtrl,
  ])

  useEffect(() => {
    if ((window as any).anime) return

    const script = document.createElement("script")
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-gray-500">Chargement des projets...</div>
      </div>
    )
  }

  if (error || !projects) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-red-500">
          Erreur lors du chargement des projets
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative w-full my-[8vh]"
      style={{
        height: TILE_HEIGHT + TITLE_TOP_OFFSET + DESCRIPTION_HEIGHT,
      }}
    >
      <motion.div
        ref={viewportRef}
        className="absolute inset-0"
        style={{
          perspective: "1000px",
          perspectiveOrigin: "50% 30%",
        }}
        animate={{ scale: isDragging ? DRAG_SCALE : 1 }}
        transition={CONTAINER_SCALE_TRANSITION}
      >
        <motion.div
          className="absolute top-0 left-0 flex items-start cursor-grab active:cursor-grabbing select-none"
          style={{
            gap: ITEM_GAP,
            willChange: "transform",
            transformStyle: "preserve-3d",
            paddingLeft: VIEW_PADDING,
            paddingRight: VIEW_PADDING,
          }}
          animate={imagesCtrl}
          initial={{ x: 0 }}
          onPointerDown={handlers.onPointerDown}
          onPointerMove={handlers.onPointerMove}
          onPointerUp={handlers.onPointerUp}
          onPointerLeave={handlers.onPointerUp}
        >
          {projects.map((p, i) => {
            // Récupérer l'URL de la première image
            const imageUrl =
              typeof p.images?.[0] === "string"
                ? p.images[0]
                : p.images?.[0]?.url || ""

            return (
              <ProjectTile
                key={p.id}
                projectId={p.id}
                imageUrl={imageUrl}
                width={ITEM_WIDTH}
                height={TILE_HEIGHT}
                color={"#f0f0f0"}
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
            top: `${TILE_HEIGHT + TITLE_TOP_OFFSET}px`,
            gap: ITEM_GAP,
            willChange: "transform",
            paddingLeft: VIEW_PADDING,
            paddingRight: VIEW_PADDING,
          }}
          animate={titlesCtrl}
          initial={{ x: 0 }}
        >
          {projects.map((p, i) => {
            // Récupérer les noms des technologies
            const techNames =
              p.technologies
                ?.map((tech) => (typeof tech === "string" ? tech : tech.title))
                .filter(Boolean)
                .join(", ") || ""

            return (
              <ProjectDescription
                key={`titles-${p.id}`}
                title={p.name}
                subtitle={p.name}
                description={p.description}
                tags={techNames}
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
