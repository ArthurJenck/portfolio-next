'use client'

import { createContext, useContext } from 'react'
import type { MotionValue } from 'framer-motion'

interface ProjectSliderContextValue {
    scrollTo: (index: number) => void
    coverProgress: MotionValue<number>
    isMobile: boolean
}

export const ProjectSliderContext = createContext<ProjectSliderContextValue | null>(null)

export const useProjectSlider = (): ProjectSliderContextValue => {
    const ctx = useContext(ProjectSliderContext)
    if (!ctx) throw new Error('useProjectSlider must be used within ProjectSlider')
    return ctx
}
