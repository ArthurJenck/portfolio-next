'use client'

import { useRecordContext, useRefresh } from 'react-admin'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { useState } from 'react'

interface ReorderButtonsProps {
    resourceName: string
    idField?: string
}

export const ReorderButtons = ({ resourceName, idField = 'id' }: ReorderButtonsProps) => {
    const record = useRecordContext()
    const refresh = useRefresh()
    const [loading, setLoading] = useState(false)

    const handleReorder = async (direction: 'up' | 'down') => {
        if (!record || loading) return

        setLoading(true)
        try {
            // Construire le nom du champ ID selon la ressource
            let bodyField = 'id'
            if (resourceName === 'projects') {
                bodyField = 'projectId'
            } else if (resourceName === 'skills') {
                bodyField = 'skillId'
            } else if (resourceName === 'skill-categories') {
                bodyField = 'categoryId'
            } else if (resourceName === 'contact-links') {
                bodyField = 'contactLinkId'
            }

            const response = await fetch(`/api/${resourceName}/reorder`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    [bodyField]: record[idField],
                    direction,
                }),
            })

            if (response.ok) {
                refresh()
            }
        } catch (error) {
            console.error('Error reordering:', error)
        } finally {
            setLoading(false)
        }
    }

    if (!record) return null

    return (
        <div className="flex gap-1">
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    handleReorder('up')
                }}
                disabled={loading}
                className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Déplacer vers le haut"
            >
                <ArrowUp className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
            <button
                onClick={(e) => {
                    e.stopPropagation()
                    handleReorder('down')
                }}
                disabled={loading}
                className="inline-flex items-center justify-center p-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                title="Déplacer vers le bas"
            >
                <ArrowDown className="w-4 h-4 text-gray-700 dark:text-gray-300" />
            </button>
        </div>
    )
}
