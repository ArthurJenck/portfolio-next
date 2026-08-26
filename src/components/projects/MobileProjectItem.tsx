import { MinimalProjectType } from '@/types/ProjectTypes'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface MobileProjectItemProps {
    project: MinimalProjectType
}

const MobileProjectItem = ({ project }: MobileProjectItemProps) => {
    return (
        <Link data-sfx="link" href={`/${project.slug}`} className="flex flex-col gap-1">
            <Image src={project.cover_image} alt={project.name} width={300} height={100} className="w-full h-auto" />
            <div className="text-xl">
                <h3 className="font-semibold">{project.name}</h3>
                <p className="font-extralight italic">{project.subtitle}</p>
                <span className="ml-0.5">—</span>
            </div>
        </Link>
    )
}

export default MobileProjectItem
