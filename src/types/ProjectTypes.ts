import { SkillChild } from './SkillsTypes'

export interface ProjectMedia {
    url: string
    type: 'image' | 'video'
    mobileUrl?: string
}

export interface ProjectMusic {
    url: string
    label?: string
    startAt?: number
    volume?: number
    rootOffset?: number
    creditUrl?: string
}

export interface DetailedProjectType {
    id: string
    name: string
    subtitle?: string
    date: string
    slug: string
    cover_image: string
    mobile_cover_image?: string
    medias: ProjectMedia[]
    summary: string
    description: string
    color: string
    stack: SkillChild[]
    githubLink?: string
    webLink?: string
    order: number
    music?: ProjectMusic
}

export interface MinimalProjectType {
    id: string
    name: string
    subtitle?: string
    date: string
    slug: string
    cover_image: string
    summary: string
    color: string
    stack: SkillChild[]
}

export type ProjectResponse = MinimalProjectType[]
