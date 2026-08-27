'use client'

import { Copy, Check, X } from 'lucide-react'
import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'

const FEEDBACK_DURATION_MS = 1000

interface CopyBtnProps {
    copyText: string
    isHovered: boolean
}

const CopyBtn = ({ copyText, isHovered }: CopyBtnProps) => {
    const [isCopied, setIsCopied] = useState(false)
    const [isError, setIsError] = useState(false)
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleCopyClick = async () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        try {
            // On ajoute le texte au presse-papier
            await navigator.clipboard.writeText(copyText)
            // Pendant une seconde, l'icone se modifie en coche pour signifier le succès de l'opération
            setIsCopied(true)
            setIsError(false)
            timeoutRef.current = setTimeout(() => {
                setIsCopied(false)
            }, FEEDBACK_DURATION_MS)
        } catch (error) {
            console.error('Erreur lors de la copie:', error)
            setIsError(true)
            setIsCopied(false)
            timeoutRef.current = setTimeout(() => {
                setIsError(false)
            }, FEEDBACK_DURATION_MS)
        }
    }

    const shouldBeVisible = isHovered || isCopied || isError

    return (
        <>
            {/* Version mobile - toujours visible */}
            <div
                data-sfx="button"
                className="md:hidden w-3.5 absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                onClick={handleCopyClick}
            >
                {isError ? (
                    <X size={24} className="w-full h-auto text-red-500" />
                ) : isCopied ? (
                    <Check size={24} className="w-full h-auto" />
                ) : (
                    <Copy size={24} className="w-full h-auto" />
                )}
            </div>

            {/* Version desktop - visible au hover */}
            <div
                data-sfx="button"
                className={cn(
                    'hidden md:block w-3.5 absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto',
                    shouldBeVisible ? 'opacity-100' : 'opacity-0',
                )}
                onClick={handleCopyClick}
            >
                {isError ? (
                    <X size={24} className="w-full h-auto text-red-500" />
                ) : isCopied ? (
                    <Check size={24} className="w-full h-auto" />
                ) : (
                    <Copy size={24} className="w-full h-auto" />
                )}
            </div>
        </>
    )
}

export default CopyBtn
