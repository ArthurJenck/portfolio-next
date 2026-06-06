'use client'

import { useMotionTemplate, useTransform, motion } from 'framer-motion'
import Image from 'next/image'
import { useProjectSlider } from './ProjectSliderContext'
import './ProjectPage.scss'

interface ProjectCoverBackgroundProps {
    name: string
    coverImage: string
}

const ProjectCoverBackground = ({ name, coverImage }: ProjectCoverBackgroundProps) => {
    const { coverProgress } = useProjectSlider()

    const blurPx = useTransform(coverProgress, [0.25, 1], [0, 5])
    const brightness = useTransform(coverProgress, [0.25, 1], [1, 0.68])
    const saturation = useTransform(coverProgress, [0.25, 1], [1, 0.84])
    const imageFilter = useMotionTemplate`blur(${blurPx}px) brightness(${brightness}) saturate(${saturation})`
    const overlayOpacity = useTransform(coverProgress, [0.25, 1], [0, 0.22])

    return (
        <div className="project-cover-background fixed inset-0 overflow-hidden">
            <motion.div className="absolute inset-0" style={{ filter: imageFilter }}>
                <Image src={coverImage} alt={name} fill priority className="object-cover cover-image" sizes="100vw" />
            </motion.div>
            <motion.div className="absolute inset-0 bg-black" style={{ opacity: overlayOpacity }} />
        </div>
    )
}

export default ProjectCoverBackground
