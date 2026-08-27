'use client'

import { useEffect, useState } from 'react'
import { COMPACT_NAV_QUERY as QUERY } from '@/config/breakpoints'

export const useIsCompactNav = (): boolean => {
    const [isCompact, setIsCompact] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia(QUERY)
        setIsCompact(mediaQuery.matches)

        const handleChange = (event: MediaQueryListEvent) => {
            setIsCompact(event.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    return isCompact
}
