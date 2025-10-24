import { SkillChild } from './SkillsTypes'

export interface ProjectMedia {
    url: string
    type: 'image' | 'video'
}

export interface DetailedProjectType {
    id: string
    name: string
    subtitle?: string
    date: string
    slug: string
    cover_image: string
    medias: ProjectMedia[]
    summary: string
    description: string
    stack: SkillChild[]
    githubLink?: string
    webLink?: string
    order: number
}

export interface MinimalProjectType {
    id: string
    name: string
    subtitle?: string
    date: string
    slug: string
    cover_image: string
    summary: string
    stack: SkillChild[]
}

export type ProjectResponse = MinimalProjectType[]
