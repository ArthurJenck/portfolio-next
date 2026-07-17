'use client'

import { useEffect, useState } from 'react'

const QUERY = '(max-width: 767px)'

export const useIsMobile = (): boolean => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        const mediaQuery = window.matchMedia(QUERY)
        setIsMobile(mediaQuery.matches)

        const handleChange = (event: MediaQueryListEvent) => {
            setIsMobile(event.matches)
        }

        mediaQuery.addEventListener('change', handleChange)
        return () => mediaQuery.removeEventListener('change', handleChange)
    }, [])

    return isMobile
}
