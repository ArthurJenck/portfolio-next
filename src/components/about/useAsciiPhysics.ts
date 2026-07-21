'use client'

import { useEffect, type RefObject } from 'react'

type Glyph = {
    char: string
    homeX: number
    homeY: number
    x: number
    y: number
    vx: number
    vy: number
}

const SAMPLE_STEP = 2
const STIFFNESS = 0.08
const DAMPING = 0.8
const REPEL_RADIUS = 42
const REPEL_STRENGTH = 9
const REST_EPSILON = 0.03
const CHAR_ASPECT = 0.58

export function useAsciiPhysics(
    containerRef: RefObject<HTMLDivElement | null>,
    canvasRef: RefObject<HTMLCanvasElement | null>,
    rows: readonly string[],
    active: boolean,
) {
    useEffect(() => {
        if (!active) return

        const container = containerRef.current
        const canvas = canvasRef.current
        if (!container || !canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const sampledRows: string[] = []
        for (let r = 0; r < rows.length; r += SAMPLE_STEP) {
            sampledRows.push(rows[r])
        }
        const rowCount = sampledRows.length
        const colCount = Math.ceil((sampledRows[0]?.length ?? 0) / SAMPLE_STEP)

        let glyphs: Glyph[] = []
        let cellW = 0
        let cellH = 0
        let fontSize = 0
        let dpr = 1
        let width = 0
        let height = 0
        let rafId = 0
        let intersecting = true

        const pointer = { x: -9999, y: -9999, active: false }

        const buildGrid = () => {
            const rect = container.getBoundingClientRect()
            dpr = Math.min(window.devicePixelRatio || 1, 2)
            width = rect.width
            cellW = width / colCount
            cellH = cellW / CHAR_ASPECT
            height = cellH * rowCount
            fontSize = cellH * 0.92

            canvas.width = Math.round(width * dpr)
            canvas.height = Math.round(height * dpr)
            canvas.style.width = `${width}px`
            canvas.style.height = `${height}px`

            glyphs = []
            for (let row = 0; row < rowCount; row++) {
                const line = sampledRows[row]
                for (let col = 0; col < colCount; col++) {
                    const char = line[col * SAMPLE_STEP]
                    if (!char || char === ' ') continue
                    const homeX = (col + 0.5) * cellW
                    const homeY = (row + 0.5) * cellH
                    glyphs.push({ char, homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0 })
                }
            }
        }

        const draw = () => {
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.fillStyle = '#ffffff'
            ctx.fillRect(0, 0, width, height)
            ctx.fillStyle = '#000000'
            ctx.font = `${fontSize}px monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            let moving = false

            for (const g of glyphs) {
                const dx = g.homeX - g.x
                const dy = g.homeY - g.y
                let ax = dx * STIFFNESS
                let ay = dy * STIFFNESS

                if (pointer.active) {
                    const pdx = g.x - pointer.x
                    const pdy = g.y - pointer.y
                    const distSq = pdx * pdx + pdy * pdy
                    if (distSq < REPEL_RADIUS * REPEL_RADIUS) {
                        const dist = Math.sqrt(distSq) || 0.001
                        const falloff = 1 - dist / REPEL_RADIUS
                        const force = REPEL_STRENGTH * falloff * falloff
                        ax += (pdx / dist) * force
                        ay += (pdy / dist) * force
                    }
                }

                g.vx = (g.vx + ax) * DAMPING
                g.vy = (g.vy + ay) * DAMPING
                g.x += g.vx
                g.y += g.vy

                if (
                    Math.abs(g.vx) > REST_EPSILON ||
                    Math.abs(g.vy) > REST_EPSILON ||
                    Math.abs(dx) > REST_EPSILON ||
                    Math.abs(dy) > REST_EPSILON
                ) {
                    moving = true
                }

                ctx.fillText(g.char, g.x, g.y)
            }

            if ((moving || pointer.active) && intersecting) {
                rafId = requestAnimationFrame(draw)
            } else {
                rafId = 0
            }
        }

        const wake = () => {
            if (!rafId && intersecting) rafId = requestAnimationFrame(draw)
        }

        buildGrid()
        draw()

        const handlePointerMove = (e: PointerEvent) => {
            const rect = container.getBoundingClientRect()
            pointer.x = e.clientX - rect.left
            pointer.y = e.clientY - rect.top
            pointer.active = true
            wake()
        }

        const handlePointerLeave = () => {
            pointer.active = false
            wake()
        }

        const handleVisibility = () => {
            if (document.hidden) {
                if (rafId) {
                    cancelAnimationFrame(rafId)
                    rafId = 0
                }
            } else {
                wake()
            }
        }

        const resizeObserver = new ResizeObserver(() => {
            buildGrid()
            wake()
        })
        resizeObserver.observe(container)

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                intersecting = entry.isIntersecting
                if (intersecting) wake()
                else if (rafId) {
                    cancelAnimationFrame(rafId)
                    rafId = 0
                }
            },
            { threshold: 0.01 },
        )
        intersectionObserver.observe(container)

        container.addEventListener('pointermove', handlePointerMove)
        container.addEventListener('pointerleave', handlePointerLeave)
        document.addEventListener('visibilitychange', handleVisibility)

        return () => {
            if (rafId) cancelAnimationFrame(rafId)
            resizeObserver.disconnect()
            intersectionObserver.disconnect()
            container.removeEventListener('pointermove', handlePointerMove)
            container.removeEventListener('pointerleave', handlePointerLeave)
            document.removeEventListener('visibilitychange', handleVisibility)
        }
    }, [active, containerRef, canvasRef, rows])
}
