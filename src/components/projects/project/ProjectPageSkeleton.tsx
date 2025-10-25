import { Skeleton } from '@/components/ui/skeleton'

const ProjectPageSkeleton = () => {
    return (
        <div className="flex flex-col justify-start items-center gap-8 md:gap-24 max-w-[80vw] mb-12 md:mb-[10vh]">
            {/* Titre et sous-titre */}
            <div className="flex flex-col items-center gap-0.5">
                <Skeleton className="h-12 w-64 md:w-96" />
                <Skeleton className="h-8 w-48 md:w-72 mt-2" />
            </div>

            {/* Contenu principal */}
            <div className="flex flex-col-reverse md:flex-row gap-4 md:gap-28 flex-1 w-full">
                {/* Colonne gauche - Description et liens */}
                <div className="flex-1/2 flex flex-col gap-4">
                    <div className="flex flex-col gap-3">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />
                    </div>
                    <div className="flex items-center gap-4 mt-4">
                        <Skeleton className="size-11 rounded-full" />
                        <Skeleton className="size-11 rounded-full" />
                    </div>
                </div>

                {/* Colonne droite - Médias et stack */}
                <div className="flex flex-col gap-16 md:gap-4 flex-1/2 w-full">
                    <Skeleton className="w-full aspect-video rounded-lg" />
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-8 w-20 rounded-full" />
                        <Skeleton className="h-8 w-24 rounded-full" />
                        <Skeleton className="h-8 w-16 rounded-full" />
                        <Skeleton className="h-8 w-28 rounded-full" />
                        <Skeleton className="h-8 w-20 rounded-full" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProjectPageSkeleton
