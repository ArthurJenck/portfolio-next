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
    active: boolean
}

const STIFFNESS = 0.1
const DAMPING = 0.8
const REST_EPSILON = 0.05
const CHAR_ASPECT = 0.58

const BASE_RADIUS = 46
const MAX_RADIUS = 150
const RADIUS_SPEED_GAIN = 1.1
const REGION_PAD = 100

const BASE_FORCE = 3
const SPEED_FORCE_GAIN = 0.12
const MAX_SPEED = 90
const RADIAL_MIX = 0.35
const FLOW_MIX = 0.75

const VELOCITY_SMOOTHING = 0.4

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

        const staticCanvas = document.createElement('canvas')
        const staticCtx = staticCanvas.getContext('2d')
        if (!staticCtx) return

        const rowCount = rows.length
        const colCount = rows[0]?.length ?? 0

        let glyphs: Glyph[] = []
        let cellW = 0
        let cellH = 0
        let fontSize = 0
        let dpr = 1
        let width = 0
        let height = 0
        let rafId = 0
        let intersecting = true

        const pointer = { x: -99999, y: -99999, active: false }
        const smoothVel = { x: 0, y: 0 }
        const prevPointer = { x: -99999, y: -99999 }

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

            staticCanvas.width = canvas.width
            staticCanvas.height = canvas.height

            glyphs = []
            for (let row = 0; row < rowCount; row++) {
                const line = rows[row]
                for (let col = 0; col < colCount; col++) {
                    const char = line[col]
                    if (!char || char === ' ') continue
                    const homeX = (col + 0.5) * cellW
                    const homeY = (row + 0.5) * cellH
                    glyphs.push({ char, homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0, active: false })
                }
            }

            staticCtx.setTransform(dpr, 0, 0, dpr, 0, 0)
            staticCtx.fillStyle = '#ffffff'
            staticCtx.fillRect(0, 0, width, height)
            staticCtx.fillStyle = '#000000'
            staticCtx.font = `${fontSize}px monospace`
            staticCtx.textAlign = 'center'
            staticCtx.textBaseline = 'middle'
            for (const g of glyphs) {
                staticCtx.fillText(g.char, g.homeX, g.homeY)
            }
        }

        const draw = () => {
            const dt = smoothVel
            dt.x += ((pointer.x - prevPointer.x) - dt.x) * VELOCITY_SMOOTHING
            dt.y += ((pointer.y - prevPointer.y) - dt.y) * VELOCITY_SMOOTHING
            prevPointer.x = pointer.x
            prevPointer.y = pointer.y

            const rawSpeed = Math.hypot(dt.x, dt.y)
            const speed = pointer.active ? Math.min(rawSpeed, MAX_SPEED) : 0
            const radius = pointer.active ? Math.min(BASE_RADIUS + speed * RADIUS_SPEED_GAIN, MAX_RADIUS) : 0
            const flowLen = speed > 0.0001 ? speed : 1
            const flowX = dt.x / flowLen
            const flowY = dt.y / flowLen

            ctx.setTransform(1, 0, 0, 1, 0, 0)
            ctx.clearRect(0, 0, canvas.width, canvas.height)
            ctx.drawImage(staticCanvas, 0, 0)
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
            ctx.font = `${fontSize}px monospace`
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            const regionRadius = Math.min(radius + REGION_PAD, 220)
            const regionRadiusSq = regionRadius * regionRadius

            const touched: Glyph[] = []

            for (const g of glyphs) {
                const pdx = g.homeX - pointer.x
                const pdy = g.homeY - pointer.y
                const inRegion = pointer.active && pdx * pdx + pdy * pdy < regionRadiusSq

                if (!inRegion && !g.active) continue
                touched.push(g)
            }

            for (const g of touched) {
                ctx.fillStyle = '#ffffff'
                ctx.fillRect(g.homeX - cellW / 2, g.homeY - cellH / 2, cellW, cellH)
            }

            let stillActive = false

            for (const g of touched) {
                const dx = g.homeX - g.x
                const dy = g.homeY - g.y
                let ax = dx * STIFFNESS
                let ay = dy * STIFFNESS

                if (pointer.active) {
                    const cdx = g.x - pointer.x
                    const cdy = g.y - pointer.y
                    const distSq = cdx * cdx + cdy * cdy
                    if (distSq < radius * radius) {
                        const dist = Math.sqrt(distSq) || 0.001
                        const falloff = 1 - dist / radius
                        const eased = falloff * falloff
                        const mag = eased * (BASE_FORCE + speed * SPEED_FORCE_GAIN)
                        const radialX = cdx / dist
                        const radialY = cdy / dist
                        ax += (radialX * RADIAL_MIX + flowX * FLOW_MIX) * mag
                        ay += (radialY * RADIAL_MIX + flowY * FLOW_MIX) * mag
                    }
                }

                g.vx = (g.vx + ax) * DAMPING
                g.vy = (g.vy + ay) * DAMPING
                g.x += g.vx
                g.y += g.vy

                const settled =
                    Math.abs(g.vx) < REST_EPSILON &&
                    Math.abs(g.vy) < REST_EPSILON &&
                    Math.abs(dx) < REST_EPSILON &&
                    Math.abs(dy) < REST_EPSILON

                if (settled) {
                    g.x = g.homeX
                    g.y = g.homeY
                    g.vx = 0
                    g.vy = 0
                    g.active = false
                } else {
                    g.active = true
                    stillActive = true
                }

                ctx.fillStyle = '#000000'
                ctx.fillText(g.char, g.x, g.y)
            }

            if ((stillActive || pointer.active) && intersecting) {
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
