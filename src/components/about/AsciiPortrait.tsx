'use client'

import { useEffect, useRef, useState } from 'react'
import { ASCII_PORTRAIT_ROWS } from './asciiPortrait.data'
import { useAsciiPhysics } from './useAsciiPhysics'

const AsciiPortrait = () => {
    const [interactive, setInteractive] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLCanvasElement>(null)

    useEffect(() => {
        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        const hasFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches
        setInteractive(!reducedMotion && hasFinePointer)
    }, [])

    useAsciiPhysics(containerRef, canvasRef, ASCII_PORTRAIT_ROWS, interactive)

    return (
        <div
            ref={containerRef}
            className="relative lg:sticky lg:top-30 w-[min(380px,100%)] md:w-[380px] @container md:@container-normal"
        >
            {interactive ? (
                <canvas ref={canvasRef} className="block w-full" />
            ) : (
                <pre className="whitespace-pre-wrap size-full md:size-auto text-[1.32cqw] md:text-[5px] bg-white text-black leading-[1.1] md:leading-none overflow-hidden flex justify-center items-center">
                    {ASCII_PORTRAIT_ROWS.join('\n')}
                </pre>
            )}
        </div>
    )
}

export default AsciiPortrait
