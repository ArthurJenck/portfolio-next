'use client'

import { useEffect, useRef, useState } from 'react'
import Lottie, { type LottieRefCurrentProps } from 'lottie-react'

interface LogoLottieProps {
    onLoopComplete: () => void
    autoplay?: boolean
    isExiting?: boolean
}

const LogoLottie = ({ onLoopComplete, autoplay = true, isExiting = false }: LogoLottieProps) => {
    const [animationData, setAnimationData] = useState<object | null>(null)
    const lottieRef = useRef<LottieRefCurrentProps>(null)

    useEffect(() => {
        fetch('/logo-paths.json')
            .then((res) => res.json())
            .then(setAnimationData)
    }, [])

    // Fige l'animation sur sa frame de boucle dès la sortie, pour ne pas repartir sur un tour pendant le fondu
    useEffect(() => {
        if (isExiting) lottieRef.current?.pause()
    }, [isExiting])

    if (!animationData) return null

    return (
        <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop
            autoplay={autoplay}
            onLoopComplete={onLoopComplete}
            className="size-55 md:size-[25vw]"
        />
    )
}

export default LogoLottie
