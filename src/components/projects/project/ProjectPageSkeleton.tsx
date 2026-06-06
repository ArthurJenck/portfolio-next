import { Skeleton } from '@/components/skeleton'

const ProjectPageSkeleton = () => {
    return (
        <>
            <div className="fixed inset-0 -z-10">
                <Skeleton className="w-full h-full rounded-none" />
            </div>

            <div className="fixed inset-0 -z-10 flex flex-col items-center justify-center gap-4">
                <Skeleton className="h-14 w-80 md:w-[32rem]" />
                <Skeleton className="w-px h-16" />
            </div>

            <div className="relative z-10 mt-[100vh] px-[6vw] md:px-[8vw] py-20 md:py-32">
                <Skeleton className="h-10 w-72 mb-8" />
                <Skeleton className="h-4 w-full max-w-2xl mb-2" />
                <Skeleton className="h-4 w-5/6 max-w-2xl mb-2" />
                <Skeleton className="h-4 w-4/5 max-w-2xl mb-12" />

                <div className="flex flex-col md:flex-row gap-8 mb-12">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex-1 flex flex-col gap-2">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-4/5" />
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-4 mb-4">
                    <Skeleton className="size-11 rounded-full" />
                    <Skeleton className="size-11 rounded-full" />
                </div>
                <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-20 rounded-full" />
                    <Skeleton className="h-8 w-24 rounded-full" />
                    <Skeleton className="h-8 w-16 rounded-full" />
                </div>
            </div>
        </>
    )
}

export default ProjectPageSkeleton
