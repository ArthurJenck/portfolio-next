import { HydrationBoundary, dehydrate } from '@tanstack/react-query'
import { getSkills } from '@/api/skillsApi'
import { getProjects } from '@/api/projectsApi'
import { getCV } from '@/api/cvApi'
import { getContactLinks } from '@/api/contactLinksApi'
import { queryKeys } from '@/lib/queryKeys'
import { getQueryClient } from '@/lib/get-query-client'
import { ReactNode } from 'react'

interface PrefetchProviderProps {
    children: ReactNode
}

export async function PrefetchProvider({ children }: PrefetchProviderProps) {
    const queryClient = getQueryClient()

    if (process.env.NEXT_PHASE !== 'phase-production-build') {
        try {
            await Promise.all([
                queryClient.prefetchQuery({
                    queryKey: queryKeys.skills,
                    queryFn: getSkills,
                }),
                queryClient.prefetchQuery({
                    queryKey: queryKeys.projects,
                    queryFn: getProjects,
                }),
                queryClient.prefetchQuery({
                    queryKey: queryKeys.cv,
                    queryFn: getCV,
                }),
                queryClient.prefetchQuery({
                    queryKey: queryKeys.contactLinks,
                    queryFn: getContactLinks,
                }),
            ])
        } catch (error) {
            console.warn('Data prefetching failed:', error)
        }
    }

    const dehydratedState = dehydrate(queryClient)

    return <HydrationBoundary state={dehydratedState}>{children}</HydrationBoundary>
}
