import { cn } from "@/lib/utils"

interface SectionTitleProps {
    title: string
    className?: string
}

const SectionTitle = ({ title, className }: SectionTitleProps) => {
    return (
        <h2
            className={cn(
                "text-center text-[7vw] md:text-[clamp(2rem,5vw,5vw)] ml-[5.5vw] md:mx-auto w-fit letter-spacing-[2px] font-bold transform-none",
                className
            )}
        >
            {title}
        </h2>
    )
}

export default SectionTitle
