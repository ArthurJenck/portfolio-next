'use client'

import { useInput } from 'react-admin'
import { useState, useEffect } from 'react'
import { Loader2, GripVertical, X } from 'lucide-react'
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SkillCategorySkillsInputProps {
    source: string
    label: string
}

interface Skill {
    id: string
    name: string
    icon: string
    description: string
}

interface SortableSkillItemProps {
    skill: Skill
    onRemove: (skillId: string) => void
}

const SortableSkillItem = ({ skill, onRemove }: SortableSkillItemProps) => {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: skill.id,
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex items-center gap-2 p-3 bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500 rounded-md"
        >
            <button
                type="button"
                className="cursor-grab active:cursor-grabbing p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded transition-colors"
                {...attributes}
                {...listeners}
            >
                <GripVertical className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={skill.icon} alt={skill.name} className="w-6 h-6 flex-shrink-0" />
            <span className="text-sm font-medium flex-1">{skill.name}</span>
            <button
                type="button"
                onClick={() => onRemove(skill.id)}
                className="p-1 hover:bg-purple-200 dark:hover:bg-purple-800 rounded transition-colors"
                title="Retirer"
            >
                <X className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </button>
        </div>
    )
}

export const SkillCategorySkillsInput = ({ source, label }: SkillCategorySkillsInputProps) => {
    const { field } = useInput({ source })
    const [allSkills, setAllSkills] = useState<Skill[]>([])
    const [selectedSkillIds, setSelectedSkillIds] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    )

    // Récupérer tous les skills
    useEffect(() => {
        const fetchSkills = async () => {
            setLoading(true)
            setError(null)

            try {
                const response = await fetch('/api/skills/all')

                if (!response.ok) {
                    throw new Error('Failed to fetch skills')
                }

                const data = await response.json()
                setAllSkills(data)
            } catch (err) {
                console.error('Error fetching skills:', err)
                setError('Erreur lors du chargement des compétences')
            } finally {
                setLoading(false)
            }
        }

        fetchSkills()
    }, [])

    // Synchroniser les selectedSkillIds avec field.value
    useEffect(() => {
        if (field.value && Array.isArray(field.value)) {
            setSelectedSkillIds(field.value)
        }
    }, [field.value])

    const handleAdd = (skillId: string) => {
        const newSelectedIds = [...selectedSkillIds, skillId]
        setSelectedSkillIds(newSelectedIds)
        field.onChange(newSelectedIds)
    }

    const handleRemove = (skillId: string) => {
        const newSelectedIds = selectedSkillIds.filter((id) => id !== skillId)
        setSelectedSkillIds(newSelectedIds)
        field.onChange(newSelectedIds)
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        if (over && active.id !== over.id) {
            const oldIndex = selectedSkillIds.indexOf(active.id as string)
            const newIndex = selectedSkillIds.indexOf(over.id as string)

            const newSelectedIds = arrayMove(selectedSkillIds, oldIndex, newIndex)
            setSelectedSkillIds(newSelectedIds)
            field.onChange(newSelectedIds)
        }
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

    const selectedSkills = selectedSkillIds.map((id) => allSkills.find((s) => s.id === id)).filter(Boolean) as Skill[]
    const availableSkills = allSkills.filter((skill) => !selectedSkillIds.includes(skill.id))

    return (
        <div className="my-4">
            <label className="block text-sm font-medium mb-2">{label}</label>

            {/* Section des compétences assignées (drag and drop) */}
            {selectedSkills.length > 0 && (
                <div className="mb-4">
                    <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Compétences assignées ({selectedSkills.length})
                    </h4>
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={selectedSkillIds} strategy={verticalListSortingStrategy}>
                            <div className="space-y-2 max-h-64 overflow-y-auto p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                                {selectedSkills.map((skill) => (
                                    <SortableSkillItem key={skill.id} skill={skill} onRemove={handleRemove} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Glissez-déposez pour réorganiser l'ordre d'affichage dans la catégorie
                    </p>
                </div>
            )}

            {/* Section des compétences disponibles */}
            {availableSkills.length > 0 && (
                <div>
                    <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Compétences disponibles ({availableSkills.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                        {availableSkills.map((skill) => (
                            <button
                                key={skill.id}
                                type="button"
                                onClick={() => handleAdd(skill.id)}
                                className="flex items-center gap-2 p-3 rounded-md cursor-pointer transition-all bg-gray-50 dark:bg-gray-700 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-500"
                            >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={skill.icon} alt={skill.name} className="w-6 h-6 flex-shrink-0" />
                                <span className="text-sm font-medium truncate flex-1 text-left">{skill.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            <input type="hidden" {...field} />
        </div>
    )
}
