'use client'

import { useEffect, useState } from 'react'

const QUERY = '(max-width: 1024px)'

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
