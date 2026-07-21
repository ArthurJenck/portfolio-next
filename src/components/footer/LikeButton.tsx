'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Particle {
    id: number
    angle: number
    distance: number
    rotate: number
}

const LikeButton = ({ initialCount }: { initialCount: number }) => {
    const [count, setCount] = useState(initialCount)
    const [liked, setLiked] = useState(false)
    const [pulseKey, setPulseKey] = useState(0)
    const [particles, setParticles] = useState<Particle[]>([])
    const particleId = useRef(0)

    const handleClick = () => {
        setCount((current) => current + 1)
        setLiked(true)
        setPulseKey((current) => current + 1)

        const newParticles = Array.from({ length: 6 }, () => {
            particleId.current += 1
            return {
                id: particleId.current,
                angle: Math.random() * 360,
                distance: 22 + Math.random() * 18,
                rotate: Math.random() * 90 - 45,
            }
        })
        setParticles((current) => [...current, ...newParticles])

        fetch('/api/likes', { method: 'POST' }).catch(() => {})
    }

    const removeParticle = (id: number) => {
        setParticles((current) => current.filter((particle) => particle.id !== id))
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="relative flex flex-col items-center gap-1.5 cursor-pointer"
            aria-label="Liker le portfolio"
        >
            <span className="relative flex items-center justify-center size-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]">
                {particles.map((particle) => (
                    <motion.span
                        key={particle.id}
                        className="absolute pointer-events-none text-[var(--accent)]"
                        initial={{ opacity: 1, scale: 0.4, x: 0, y: 0, rotate: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 1,
                            x: Math.cos((particle.angle * Math.PI) / 180) * particle.distance,
                            y: Math.sin((particle.angle * Math.PI) / 180) * particle.distance,
                            rotate: particle.rotate,
                        }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        onAnimationComplete={() => removeParticle(particle.id)}
                    >
                        <Heart className="size-3" fill="currentColor" />
                    </motion.span>
                ))}
                <motion.span
                    key={pulseKey}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.4, 0.9, 1.15, 1] }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                >
                    <Heart
                        className={cn('size-5 transition-colors duration-300', liked ? 'text-[var(--accent)]' : 'text-[var(--secondary)]')}
                        fill="currentColor"
                    />
                </motion.span>
            </span>
            <motion.span
                key={count}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-bold tabular-nums"
            >
                {count}
            </motion.span>
        </button>
    )
}

export default LikeButton
