'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const ProjectRedirect = () => {
    const router = useRouter()

    useEffect(() => {
        router.replace('/#projets')
    }, [router])

    return null
}

export default ProjectRedirect
