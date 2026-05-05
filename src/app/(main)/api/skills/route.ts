import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Skill from '@/models/Skill'
import SkillCategory from '@/models/SkillCategory'
import { Types } from 'mongoose'

interface PopulatedSkill {
    _id: Types.ObjectId
    name: string
    icon?: string
    description?: string
}

export async function GET() {
    try {
        await connectDB()

        // Récupérer toutes les catégories triées par order avec populate des skills
        const categories = await SkillCategory.find().sort({ order: 1 }).populate('skills')

        // Construire la réponse avec les skills de chaque catégorie
        const response = categories.map((category) => ({
            id: category._id.toString(),
            name: category.name,
            truncatedName: category.truncatedName,
            skills: (category.skills as unknown as PopulatedSkill[]).map((skill) => ({
                id: skill._id.toString(),
                name: skill.name,
                icon: skill.icon || '',
                description: skill.description || '',
            })),
        }))

        return NextResponse.json(response)
    } catch (error) {
        console.error('Error fetching skills:', error)
        return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    const auth = await requireAuth(request)
    if (!auth.ok) return auth.response

    try {
        await connectDB()
        const body = await request.json()

        // Si order n'est pas fourni, prendre le max + 1
        if (body.order === undefined) {
            const maxSkill = await Skill.findOne().sort({ order: -1 })
            body.order = maxSkill ? maxSkill.order + 1 : 0
        }

        const skill = await Skill.create(body)

        return NextResponse.json(skill, { status: 201 })
    } catch (error) {
        console.error('Error creating skill:', error)
        return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 })
    }
}
