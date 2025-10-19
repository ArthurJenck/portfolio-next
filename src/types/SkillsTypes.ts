export interface SkillType {
    id: string
    category: 'Front-end' | 'Back-end' | 'Outils'
    name: string
    icon?: string
    description?: string
    createdAt: string
    updatedAt: string
}

export interface SkillChild {
    id: string
    name: string
    icon: string
    description: string
    (order?: number)
}

interface SkillCategory {
    id: string
    name: string
    truncatedName: string
    skills: SkillChild[]
    (order: number)
}

type SkillResponse = SkillCategory[]
