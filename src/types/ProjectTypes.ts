import { SkillChild } from './SkillsTypes'

export interface DetailedProjectType {
    id: string
    name: string
    image: string
    description: string
    stack: SkillChild[]
    github_url?: string
    project_url?: string
}

export interface MinimalProjectType {
    id: string
    name: string
    image: string
    summary: string
    stack: SkillChild[]
}

export type ProjectResponse = MinimalProjectType[]
