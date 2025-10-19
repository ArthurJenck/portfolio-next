import { SkillResponse } from '@/types/SkillsTypes'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function getSkills(): Promise<SkillResponse> {
    const res = await fetch(`${API_URL}/api/skills`)

    if (!res.ok) {
        throw new Error('Failed to fetch skills')
    }

    return res.json()
}
