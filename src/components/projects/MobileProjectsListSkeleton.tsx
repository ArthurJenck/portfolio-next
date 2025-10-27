import { Skeleton } from '@/components/skeleton'

const MobileProjectsListSkeleton = () => {
    // Afficher 5 items pour le skeleton mobile
    const skeletonCount = 5

    return (
        <div className="flex flex-col gap-8 p-[5.5vw]">
            {Array.from({ length: skeletonCount }).map((_, i) => (
                <div key={i} className="flex flex-col gap-1">
                    <Skeleton className="w-full aspect-[3/1] rounded-lg" />
                    <Skeleton className="h-6 w-3/4 mt-1" />
                </div>
            ))}
        </div>
    )
}

export default MobileProjectsListSkeleton
