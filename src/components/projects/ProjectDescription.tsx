import { motion } from 'framer-motion'
import {
    DESCRIPTION_OPACITY_TRANSITION,
    DESCRIPTION_TRANSLATE_Y,
    DRAG_SCALE,
    SUBTITLE_UNDERLINE_W,
    TAGS_OPACITY_TRANSITION,
    TITLE_SCALE_TRANSITION,
} from './projects.config'

interface ProjectDescriptionProps {
    title: string
    subtitle: string
    description: string
    date: Date
    tag: string
    isHovered: boolean
    isDragging: boolean
    width: number
}

export const ProjectDescription: React.FC<ProjectDescriptionProps> = ({
    title,
    subtitle,
    description,
    date,
    tag,
    isHovered,
    isDragging,
    width,
}) => {
    const inverseScale = isDragging ? 1 / DRAG_SCALE : 1

    return (
        <div style={{ width }}>
            <motion.div
                animate={{ scale: inverseScale }}
                transition={TITLE_SCALE_TRANSITION}
                style={{ transformOrigin: 'left top' }}
            >
                <div className="uppercase text-2xl font-montserrat">{title}</div>
                <div className="italic -ml-[5px] px-[5px] relative text-xl font-montserrat">
                    {subtitle}
                    <span
                        className="absolute block"
                        style={{
                            top: '100%',
                            left: 5,
                            width: SUBTITLE_UNDERLINE_W,
                            height: 1,
                            marginTop: 15,
                            background: '#fff',
                        }}
                    />
                </div>

                <div className="mt-6 flex flex-col gap-1.5">
                    <div
                        className="text-xs w-[250px] text-white/90 transition-all"
                        style={{
                            opacity: isHovered ? 1 : 0,
                            transform: `translateY(${isHovered ? 0 : DESCRIPTION_TRANSLATE_Y}px)`,
                            transitionDuration: DESCRIPTION_OPACITY_TRANSITION.duration,
                            transitionDelay: DESCRIPTION_OPACITY_TRANSITION.delay,
                        }}
                    >
                        {description}
                    </div>
                    <div
                        className="text-[10px] uppercase w-[250px] text-neutral-500 transition-all"
                        style={{
                            opacity: isHovered ? 1 : 0,
                            transform: `translateY(${isHovered ? 0 : DESCRIPTION_TRANSLATE_Y}px)`,
                            transitionDuration: TAGS_OPACITY_TRANSITION.duration,
                            transitionDelay: TAGS_OPACITY_TRANSITION.delay,
                        }}
                    >
                        {date.toLocaleDateString('fr-FR', { year: 'numeric', month: 'numeric' })} - {tag}
                    </div>
                </div>
            </motion.div>
        </div>
    )
}
