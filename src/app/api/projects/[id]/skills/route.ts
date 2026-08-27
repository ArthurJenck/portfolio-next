import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import Project from '@/server/models/Project'
import Skill from '@/server/models/Skill'
import { Types } from 'mongoose'
import { revalidateProjectSkillsContent } from '@/server/content/revalidate-public-content'

interface SkillWithStatus {
    id: string
    name: string
    icon: string
    description: string
    assigned: boolean
}

// GET : Liste tous les skills avec leur statut d'attribution pour ce projet
export const GET = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params

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
    },
    { auth: true, errorMessage: 'Failed to fetch project skills' },
)

// PUT : Met à jour la stack du projet
export const PUT = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
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

        revalidateProjectSkillsContent(project.slug)

        return NextResponse.json({
            success: true,
            projectId: id,
            stack: validSkillIds,
        })
    },
    { auth: true, errorMessage: 'Failed to update project skills' },
)
