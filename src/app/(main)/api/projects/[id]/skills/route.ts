import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import connectDB from '@/lib/mongodb'
import Project from '@/models/Project'
import Skill from '@/models/Skill'
import { Types } from 'mongoose'

interface SkillWithStatus {
    id: string
    name: string
    icon: string
    description: string
    assigned: boolean
}

// GET : Liste tous les skills avec leur statut d'attribution pour ce projet
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    try {
        await connectDB()

        // Récupérer le projet
        const project = await Project.findById(id)
        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

        // Récupérer tous les skills disponibles
        const allSkills = await Skill.find().sort({ order: 1 })

        // Convertir les ObjectIds de la stack en strings pour comparaison
        // Filtrer les valeurs null/undefined (skills supprimés)
        const projectSkillIds = project.stack
            .filter((skillId: Types.ObjectId | null) => skillId !== null && skillId !== undefined)
            .map((skillId: Types.ObjectId) => skillId.toString())

        // Construire la réponse avec le statut assigned pour chaque skill
        const skillsWithStatus: SkillWithStatus[] = allSkills.map((skill) => ({
            id: skill._id.toString(),
            name: skill.name,
            icon: skill.icon,
            description: skill.description || '',
            assigned: projectSkillIds.includes(skill._id.toString()),
        }))

        return NextResponse.json({
            projectId: id,
            skills: skillsWithStatus,
        })
    } catch (error) {
        console.error('Error fetching project skills:', error)
        return NextResponse.json({ error: 'Failed to fetch project skills' }, { status: 500 })
    }
}

// PUT : Met à jour la stack du projet
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    try {
        await connectDB()
        const body = await request.json()

        // Valider que skillIds est un array
        if (!Array.isArray(body.skillIds)) {
            return NextResponse.json({ error: 'skillIds must be an array' }, { status: 400 })
        }

        // Filtrer pour ne garder que des strings valides
        const validSkillIds = body.skillIds.filter((id: unknown) => typeof id === 'string' && id.length > 0)

        // Vérifier que tous les IDs existent
        const existingSkills = await Skill.find({ _id: { $in: validSkillIds } })
        if (existingSkills.length !== validSkillIds.length) {
            return NextResponse.json({ error: 'Some skill IDs are invalid' }, { status: 400 })
        }

        // Mettre à jour la stack du projet
        const project = await Project.findByIdAndUpdate(id, { stack: validSkillIds }, { new: true })

        if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 })

        return NextResponse.json({
            success: true,
            projectId: id,
            stack: validSkillIds,
        })
    } catch (error) {
        console.error('Error updating project skills:', error)
        return NextResponse.json({ error: 'Failed to update project skills' }, { status: 500 })
    }
}
