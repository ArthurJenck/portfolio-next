'use client'

import { useEffect } from 'react'

const CV = () => {
    useEffect(() => {
        document.title = 'Arthur Jenck – CV'
        document.body.style.overflow = 'hidden'
    }, [])
    return (
        // Le zoom n'a pas besoin d'être au-dessus de 25%
        <iframe
            src="https://3jrx06emyedlbjzt.public.blob.vercel-storage.com/CV_Arthur-Jenck"
            width={'100%'}
            height={'100%'}
            style={{ width: '100%', height: '100dvh', border: 'none' }}
        />
    )
}

export default CV
