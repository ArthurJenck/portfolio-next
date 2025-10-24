'use client'

import { useInput, useRecordContext } from 'react-admin'
import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProjectSkillsInputProps {
    source: string
    label: string
}

interface SkillWithStatus {
    id: string
    name: string
    icon: string
    description: string
    assigned: boolean
}

export const ProjectSkillsInput = ({ source, label }: ProjectSkillsInputProps) => {
    const { field } = useInput({ source })
    const record = useRecordContext()
    const [skills, setSkills] = useState<SkillWithStatus[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Récupérer les skills avec leur statut
    useEffect(() => {
        const fetchSkills = async () => {
            setLoading(true)
            setError(null)

            try {
                let url: string

                if (record?.id) {
                    // Mode édition : récupérer les skills avec leur statut pour ce projet
                    url = `/api/projects/${record.id}/skills`
                } else {
                    // Mode création : récupérer tous les skills
                    url = '/api/skills/all'
                }

                const response = await fetch(url)

                if (!response.ok) {
                    throw new Error('Failed to fetch skills')
                }

                const data = await response.json()

                if (record?.id) {
                    // En mode édition, on reçoit { projectId, skills }
                    setSkills(data.skills)
                } else {
                    // En mode création, on reçoit directement un array de skills
                    // On les marque tous comme non assignés par défaut
                    setSkills(
                        data.map((skill: { id: string; name: string; icon: string; description: string }) => ({
                            ...skill,
                            assigned: false,
                        })),
                    )
                }
            } catch (err) {
                console.error('Error fetching skills:', err)
                setError('Erreur lors du chargement des compétences')
            } finally {
                setLoading(false)
            }
        }

        fetchSkills()
    }, [record?.id])

    // Synchroniser l'état local avec le field value au chargement
    useEffect(() => {
        if (skills.length > 0 && field.value && Array.isArray(field.value)) {
            const updatedSkills = skills.map((skill) => ({
                ...skill,
                assigned: field.value.includes(skill.id),
            }))
            setSkills(updatedSkills)
        }
    }, [field.value])

    const handleToggle = (skillId: string) => {
        // Mettre à jour l'état local
        const updatedSkills = skills.map((skill) =>
            skill.id === skillId ? { ...skill, assigned: !skill.assigned } : skill,
        )
        setSkills(updatedSkills)

        // Mettre à jour le field value avec les IDs des skills assignés
        const assignedIds = updatedSkills.filter((skill) => skill.assigned).map((skill) => skill.id)
        field.onChange(assignedIds)
    }

    if (loading) {
        return (
            <div className="my-4">
                <label className="block text-sm font-medium mb-2">{label}</label>
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Chargement des compétences...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="my-4">
                <label className="block text-sm font-medium mb-2">{label}</label>
                <div className="text-red-600 dark:text-red-400">{error}</div>
            </div>
        )
    }

    return (
        <div className="my-4">
            <label className="block text-sm font-medium mb-2">{label}</label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                {skills.map((skill) => (
                    <label
                        key={skill.id}
                        className={`flex items-center gap-2 p-3 rounded-md cursor-pointer transition-all ${
                            skill.assigned
                                ? 'bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500'
                                : 'bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                        }`}
                    >
                        <input
                            type="checkbox"
                            checked={skill.assigned}
                            onChange={() => handleToggle(skill.id)}
                            className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                        />
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={skill.icon} alt={skill.name} className="w-6 h-6 flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{skill.name}</span>
                        </div>
                    </label>
                ))}
            </div>
            {skills.filter((s) => s.assigned).length > 0 && (
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    {skills.filter((s) => s.assigned).length} compétence(s) sélectionnée(s)
                </p>
            )}
            <input type="hidden" {...field} />
        </div>
    )
}
