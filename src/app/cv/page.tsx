'use client'

import { useEffect } from 'react'
import { useCV } from '@/hooks/useCV'

const CV = () => {
    const { data: cv, isLoading, error } = useCV()

    useEffect(() => {
        document.title = 'Arthur Jenck – CV'
        document.body.style.overflow = 'hidden'
    }, [])

    if (isLoading) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100dvh',
                    fontFamily: 'system-ui',
                }}
            >
                Chargement du CV...
            </div>
        )
    }

    if (error || !cv) {
        return (
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100dvh',
                    fontFamily: 'system-ui',
                }}
            >
                Erreur lors du chargement du CV
            </div>
        )
    }

    return (
        // Le zoom n'a pas besoin d'être au-dessus de 25%
        <iframe
            src={cv.url}
            width={'100%'}
            height={'100%'}
            style={{ width: '100%', height: '100dvh', border: 'none' }}
        />
    )
}

export default CV
