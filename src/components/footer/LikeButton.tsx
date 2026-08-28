'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { useRef, useState } from 'react'
import {
    DEGREES_PER_HALF_TURN,
    PARTICLE_ANGLE_MAX_DEG,
    PARTICLE_COUNT,
    PARTICLE_DISTANCE_MIN,
    PARTICLE_DISTANCE_RANGE,
    PARTICLE_ROTATE_CENTER,
    PARTICLE_ROTATE_RANGE,
    PULSE_SCALE_KEYFRAMES,
} from './likeButton.config'

interface Particle {
    id: number
    angle: number
    distance: number
    rotate: number
}

interface LikeButtonProps {
    initialCount: number
    hideCount?: boolean
    className?: string
}

const LikeButton = ({ initialCount, hideCount = false, className }: LikeButtonProps) => {
    const [count, setCount] = useState(initialCount)
    const [liked, setLiked] = useState(false)
    const [pulseKey, setPulseKey] = useState(0)
    const [particles, setParticles] = useState<Particle[]>([])
    const particleId = useRef(0)

    const handleClick = () => {
        setCount((current) => current + 1)
        setLiked(true)
        setPulseKey((current) => current + 1)

        const newParticles = Array.from({ length: PARTICLE_COUNT }, () => {
            particleId.current += 1
            return {
                id: particleId.current,
                angle: Math.random() * PARTICLE_ANGLE_MAX_DEG,
                distance: PARTICLE_DISTANCE_MIN + Math.random() * PARTICLE_DISTANCE_RANGE,
                rotate: Math.random() * PARTICLE_ROTATE_RANGE - PARTICLE_ROTATE_CENTER,
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
            data-sfx="like"
            onClick={handleClick}
            className="relative flex flex-col items-center gap-1.5 cursor-pointer"
            aria-label="Liker le portfolio"
        >
            <motion.span
                className={cn(
                    'relative flex items-center justify-center size-11 rounded-full bg-white shadow-[0_2px_10px_rgba(0,0,0,0.35)]',
                    className,
                )}
                transition={{ type: 'spring', stiffness: 400, damping: 12 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
            >
                {particles.map((particle) => (
                    <motion.span
                        key={particle.id}
                        className="absolute pointer-events-none text-(--accent-like)"
                        initial={{ opacity: 1, scale: 0.4, x: 0, y: 0, rotate: 0 }}
                        animate={{
                            opacity: 0,
                            scale: 1,
                            x: Math.cos((particle.angle * Math.PI) / DEGREES_PER_HALF_TURN) * particle.distance,
                            y: Math.sin((particle.angle * Math.PI) / DEGREES_PER_HALF_TURN) * particle.distance,
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
                    animate={{ scale: PULSE_SCALE_KEYFRAMES }}
                    transition={{ duration: 0.45, ease: 'easeOut' }}
                    className="relative inline-flex"
                >
                    <Heart
                        className={cn(
                            'size-5 transition-colors duration-300',
                            liked ? 'text-(--accent-like)' : 'text-(--secondary)',
                        )}
                        fill="currentColor"
                    />
                    <span
                        aria-hidden
                        className={cn(
                            'absolute top-[16%] left-[12%] w-[38%] h-[20%] -rotate-30 rounded-full transition-opacity duration-300 pointer-events-none',
                            liked ? 'opacity-90' : 'opacity-0',
                        )}
                        style={{
                            background:
                                'radial-gradient(ellipse at center, rgba(255,235,240,0.95) 0%, rgba(255,235,240,0) 75%)',
                        }}
                    />
                </motion.span>
            </motion.span>
            {!hideCount && (
                <motion.span
                    key={count}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-xs font-bold tabular-nums"
                >
                    {count}
                </motion.span>
            )}
        </button>
    )
}

export default LikeButton
