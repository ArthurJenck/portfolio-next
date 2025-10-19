import { SkillChild } from './SkillsTypes'
import { TechType } from './TechTypes'

export type MediaType = {
    id: string
    alt?: string
    url: string
    filename: string
    mimeType: string
    filesize: number
    width?: number
    height?: number
    sizes?: {
        thumbnail?: {
            url: string
            width: number
            height: number
        }
        card?: {
            url: string
            width: number
            height: number
        }
        tablet?: {
            url: string
            width: number
            height: number
        }
    }
}

export interface ProjectType {
    id: string
    name: string
    date: string
    description: string
    technologies?: TechType[]
    githubLink?: string
    webLink?: string
    images?: MediaType[]
    createdAt: string
    updatedAt: string
}

interface DetailedProjectType {
    id: string
    name: string
    image: string
    description: string
    stack: SkillChild[]
    github_url?: string
    project_url?: string
}

interface MinimalProjectType {
    id: string
    name: string
    image: string
    summary: string
    stack: SkillChild[]
    (order: number)
}

type ProjectResponse = MinimalProjectType[]
