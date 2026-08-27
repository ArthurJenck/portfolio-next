'use client'

import { useMotionTemplate, useTransform, motion } from 'framer-motion'
import Image from 'next/image'
import { useProjectSlider } from './ProjectSliderContext'
import {
    BLUR_RANGE,
    BRIGHTNESS_RANGE,
    OVERLAY_OPACITY_RANGE,
    OVERLAY_PROGRESS_RANGE,
    SATURATION_RANGE,
    VISUAL_EFFECT_PROGRESS_RANGE,
} from './projectCover.config'

interface ProjectCoverBackgroundProps {
    name: string
    coverImage: string
    mobileCoverImage?: string
}

const ProjectCoverBackground = ({ name, coverImage, mobileCoverImage }: ProjectCoverBackgroundProps) => {
    const { coverProgress } = useProjectSlider()

    const blurPx = useTransform(coverProgress, VISUAL_EFFECT_PROGRESS_RANGE, BLUR_RANGE)
    const brightness = useTransform(coverProgress, VISUAL_EFFECT_PROGRESS_RANGE, BRIGHTNESS_RANGE)
    const saturation = useTransform(coverProgress, VISUAL_EFFECT_PROGRESS_RANGE, SATURATION_RANGE)
    const imageFilter = useMotionTemplate`blur(${blurPx}px) brightness(${brightness}) saturate(${saturation})`
    const overlayOpacity = useTransform(coverProgress, OVERLAY_PROGRESS_RANGE, OVERLAY_OPACITY_RANGE)

    return (
        <div className="project-cover-background fixed inset-0 overflow-hidden">
            <motion.div className="absolute inset-0" style={{ filter: imageFilter }}>
                {mobileCoverImage && (
                    <Image src={mobileCoverImage} alt={name} fill priority className="object-cover cover-image md:hidden" sizes="100vw" quality={90} />
                )}
                <Image src={coverImage} alt={name} fill priority className={`object-cover cover-image${mobileCoverImage ? ' hidden md:block' : ''}`} sizes="100vw" quality={90} />
            </motion.div>
            <motion.div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
        </div>
    )
}

export default ProjectCoverBackground
