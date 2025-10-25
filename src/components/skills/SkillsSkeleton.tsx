import { Skeleton } from '@/components/ui/skeleton'

const SkillsSkeleton = () => {
    const categoryCount = 3
    const skillsPerCategory = 5

    return (
        <>
            {Array.from({ length: categoryCount }).map((_, categoryIndex) => (
                <div
                    key={categoryIndex}
                    className="w-fit relative left-[5.5vw] lg:left-[15vw] top-0 mt-[5svh] lg:mt-[8svh] 3xl:mt-[15svh]"
                >
                    {/* Titre de la catégorie */}
                    <div className="md:hidden font-bold sticky top-[50svh] float-left text-right min-w-16">
                        <Skeleton className="h-6 w-16" />
                    </div>
                    <div className="hidden md:block font-bold sticky top-[50svh] float-left text-right min-w-[clamp(120px,14vw,14vw)]">
                        <Skeleton className="h-8 w-[clamp(120px,14vw,14vw)]" />
                    </div>

                    {/* Liste des skills */}
                    <ul className="list-none flex flex-col gap-6 lg:gap-10 top-0 max-w-[68vw] lg:max-w-[55vw] pl-[3vw]">
                        {Array.from({ length: skillsPerCategory }).map((_, skillIndex) => (
                            <li
                                key={skillIndex}
                                className="flex flex-col lg:flex-row gap-1 lg:gap-[2.5vw] items-start lg:items-center"
                            >
                                {/* Icône skeleton */}
                                <Skeleton className="w-[clamp(1.5rem,3.5vw,3.5vw)] lg:w-[5vw] h-[clamp(1.5rem,3.5vw,3.5vw)] lg:h-[5vw] rounded-md" />

                                {/* Nom et description skeleton */}
                                <div className="flex flex-col gap-1 flex-1">
                                    <Skeleton className="h-5 lg:h-6 w-24 lg:w-32" />
                                    <Skeleton className="h-4 lg:h-5 w-48 lg:w-64" />
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </>
    )
}

export default SkillsSkeleton
