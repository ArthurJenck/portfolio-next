'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import DottedBackground from '@/components/ui/DottedBackground'
import { IDLE_FALLBACK_MS, IDLE_TIMEOUT_MS } from './background.config'

const SceneBackground = dynamic(() => import('./SceneBackground'), {
    ssr: false,
    loading: () => <DottedBackground />,
})

const SiteBackground = () => {
    const pathname = usePathname()
    const [idle, setIdle] = useState(false)

    useEffect(() => {
        if (typeof window.requestIdleCallback === 'function') {
            const handle = window.requestIdleCallback(() => setIdle(true), { timeout: IDLE_TIMEOUT_MS })
            return () => window.cancelIdleCallback(handle)
        }

        const handle = window.setTimeout(() => setIdle(true), IDLE_FALLBACK_MS)
        return () => window.clearTimeout(handle)
    }, [])

    // Le fond 3D est réservé à la home : ailleurs les médias projet ou le CV prennent le dessus.
    if (pathname !== '/' || !idle) return <DottedBackground />

    return <SceneBackground />
}

export default SiteBackground
