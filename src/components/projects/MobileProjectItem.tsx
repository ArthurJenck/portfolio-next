import { MinimalProjectType } from '@/types/ProjectTypes'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface MobileProjectItemProps {
    project: MinimalProjectType
}

const MobileProjectItem = ({ project }: MobileProjectItemProps) => {
    return (
        <Link href={`/${project.slug}`} className="flex flex-col gap-1">
            <Image src={project.cover_image} alt={project.name} width={300} height={100} className="w-full h-auto" />
            <h3 className="text-xl font-extralight">
                {project.name} – {project.subtitle}
            </h3>
        </Link>
    )
}

export default MobileProjectItem
