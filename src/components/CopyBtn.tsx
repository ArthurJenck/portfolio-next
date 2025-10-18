"use client"

import { Copy, Check, X } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"

interface CopyBtnProps {
    copyText: string
    isHovered: boolean
}

const CopyBtn = ({ copyText, isHovered }: CopyBtnProps) => {
    const [isCopied, setIsCopied] = useState(false)
    const [isError, setIsError] = useState(false)
    const prevFeedbackRef = useRef(false)

    const handleCopyClick = async () => {
        try {
            // On ajoute le texte au presse-papier
            await navigator.clipboard.writeText(copyText)
            // Pendant une seconde, l'icone se modifie en coche pour signifier le succès de l'opération
            setIsCopied(true)
            setTimeout(() => {
                setIsCopied(false)
            }, 1000)
        } catch (error) {
            console.error("Erreur lors de la copie:", error)
            setIsError(true)
            setTimeout(() => {
                setIsError(false)
            }, 1000)
        }
    }

    const shouldBeVisible = isHovered || isCopied || isError
    const isFeedback = isCopied || isError

    // Capture le changement d'état feedback → non-feedback
    const wasJustFeedback = prevFeedbackRef.current && !isFeedback && !isHovered

    useEffect(() => {
        prevFeedbackRef.current = isFeedback
    }, [isFeedback])

    // Transition instantanée si on sort d'un feedback state vers hidden, sinon transition normale
    const opacityTransition = wasJustFeedback ? 0 : 0.2

    return (
        <>
            {/* Version mobile - toujours visible */}
            <div
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
            <motion.div
                className="hidden md:block w-3.5 absolute -right-6 top-1/2 -translate-y-1/2 cursor-pointer pointer-events-auto"
                onClick={handleCopyClick}
                animate={{ opacity: shouldBeVisible ? 1 : 0 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                transition={{
                    opacity: { duration: opacityTransition },
                    scale: { duration: 0.2 },
                }}
            >
                {isError ? (
                    <X size={24} className="w-full h-auto text-red-500" />
                ) : isCopied ? (
                    <Check size={24} className="w-full h-auto" />
                ) : (
                    <Copy size={24} className="w-full h-auto" />
                )}
            </motion.div>
        </>
    )
}

export default CopyBtn
