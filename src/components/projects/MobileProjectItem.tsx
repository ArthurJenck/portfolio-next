import { MinimalProjectType } from '@/types/ProjectTypes'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import testImage from '@/assets/images/hero-placeholder.png'

interface MobileProjectItemProps {
    project: MinimalProjectType
}

const MobileProjectItem = ({ project }: MobileProjectItemProps) => {
    return (
        <Link href={`/projects/${project.slug}`}>
            <Image src={testImage} alt={project.name} width={300} height={100} className="w-full h-auto" />
            <h3 className="text-xl font-extralight">Odace+ – SaaS complet</h3>
        </Link>
    )
}

export default MobileProjectItem
