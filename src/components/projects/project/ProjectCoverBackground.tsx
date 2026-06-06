'use client'

import { useMotionTemplate, useTransform, motion } from 'framer-motion'
import Image from 'next/image'
import { useProjectSlider } from './ProjectSliderContext'

interface ProjectCoverBackgroundProps {
    name: string
    coverImage: string
    mobileCoverImage?: string
}

const ProjectCoverBackground = ({ name, coverImage, mobileCoverImage }: ProjectCoverBackgroundProps) => {
    const { coverProgress } = useProjectSlider()

    const blurPx = useTransform(coverProgress, [0.25, 1], [0, 5])
    const brightness = useTransform(coverProgress, [0.25, 1], [1, 0.68])
    const saturation = useTransform(coverProgress, [0.25, 1], [1, 0.84])
    const imageFilter = useMotionTemplate`blur(${blurPx}px) brightness(${brightness}) saturate(${saturation})`
    const overlayOpacity = useTransform(coverProgress, [0, 1], [0.1, 0.3])

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
