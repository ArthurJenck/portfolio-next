'use client'

import { useCallback, useRef, useState } from 'react'
import DottedBackground from '@/components/ui/DottedBackground'
import { useIsMobile } from '@/hooks/useIsMobile'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import { FADE_IN_MS, START_SENTINEL_CLASS } from './background.config'
import { createScene } from './scene'
import { useBackgroundRenderer } from './useBackgroundRenderer'

const SceneBackground = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const hostRef = useRef<HTMLDivElement>(null)
    const sentinelRef = useRef<HTMLDivElement>(null)
    const [ready, setReady] = useState(false)
    const [failed, setFailed] = useState(false)
    const prefersReducedMotion = usePrefersReducedMotion()
    const isMobile = useIsMobile()

    const handleReady = useCallback(() => setReady(true), [])
    const handleContextLost = useCallback(() => setFailed(true), [])

    const active = !prefersReducedMotion && !failed

    useBackgroundRenderer({
        containerRef,
        hostRef,
        sentinelRef,
        active,
        isMobile,
        createScene,
        onReady: handleReady,
        onContextLost: handleContextLost,
    })

    if (!active) return <DottedBackground />

    return (
        <>
            <div ref={sentinelRef} aria-hidden="true" className={START_SENTINEL_CLASS} />
            <div
                ref={containerRef}
                aria-hidden="true"
                className="fixed inset-0 -z-10"
                style={{ background: 'var(--primary)' }}
            >
                <div
                    ref={hostRef}
                    className="size-full transition-opacity [&>canvas]:block [&>canvas]:size-full"
                    style={{ opacity: ready ? 1 : 0, transitionDuration: `${FADE_IN_MS}ms` }}
                />
            </div>
        </>
    )
}

export default SceneBackground
