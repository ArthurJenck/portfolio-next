import { SkillChild } from './SkillsTypes'

export interface DetailedProjectType {
    id: string
    name: string
    subtitle?: string
    date: string
    slug: string
    image: string
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
    image: string
    summary: string
    stack: SkillChild[]
}

export type ProjectResponse = MinimalProjectType[]
