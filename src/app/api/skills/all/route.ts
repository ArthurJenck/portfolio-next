import { NextResponse } from 'next/server'
import connectDB from '@/lib/mongodb'
import Skill from '@/models/Skill'

export async function GET() {
    try {
        await connectDB()

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
    } catch (error) {
        console.error('Error fetching all skills:', error)
        return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }
}
