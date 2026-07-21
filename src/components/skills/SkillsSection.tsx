'use client'

import { useEffect, useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import SectionTitle from '@/components/SectionTitle'
import SkillCategory from './SkillCategory'
import { SkillResponse } from '@/types/SkillsTypes'

const Skills = ({ skillCategories }: { skillCategories: SkillResponse }) => {
    const containerRef = useRef<HTMLDivElement>(null)
    const timelineRef = useRef<HTMLDivElement>(null)
    const [height, setHeight] = useState(0)

    useEffect(() => {
        const updateHeight = () => {
            if (timelineRef.current) {
                setHeight(timelineRef.current.getBoundingClientRect().height)
            }
        }
        updateHeight()
        window.addEventListener('resize', updateHeight)
        return () => window.removeEventListener('resize', updateHeight)
    }, [skillCategories])

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start 15%', 'end 60%'],
    })

    const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height])
    const opacityTransform = useTransform(scrollYProgress, [0, 0.05], [0, 1])

    return (
        <section id="skills" className="py-16 relative">
            <SectionTitle title="Compétences" />
            <div ref={containerRef} className="relative">
                <div
                    style={{ height: height + 'px' }}
                    className="absolute top-0 left-[calc(5.5vw+2.5rem)] md:left-[15vw] lg:left-[25vw] w-0.5 overflow-hidden rounded-full bg-linear-to-b from-transparent via-(--white)/15 to-transparent mask-[linear-gradient(to_bottom,transparent_0%,black_8%,black_92%,transparent_100%)] z-0"
                >
                    <motion.div
                        style={{ height: heightTransform, opacity: opacityTransform }}
                        className="absolute inset-x-0 top-0 w-0.5 rounded-full bg-linear-to-t from-[#5a3e79] via-[#714e97] to-[#8d6aac]"
                    />
                </div>
                <div ref={timelineRef} className="relative z-10">
                    {skillCategories.map((category) => (
                        <SkillCategory
                            key={category.id}
                            name={category.name}
                            truncatedName={category.truncatedName}
                            skills={category.skills}
                        />
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Skills
