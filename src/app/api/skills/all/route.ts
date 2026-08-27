import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import Skill from '@/server/models/Skill'

export const GET = route(
    async () => {
        // Retourner tous les skills en format plat pour l'admin
        const skills = await Skill.find().sort({ order: 1 })

        const response = skills.map((skill) => ({
            id: skill._id.toString(),
            name: skill.name,
            icon: skill.icon || '',
            description: skill.description || '',
            order: skill.order,
        }))

        return NextResponse.json(response)
    },
    { errorMessage: 'Failed to fetch skills' },
)
