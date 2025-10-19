export interface SkillChild {
    id: string
    name: string
    icon: string
    description: string
}

export interface SkillCategory {
    id: string
    name: string
    truncatedName: string
    skills: SkillChild[]
}

export type SkillResponse = SkillCategory[]
