"use client"

import {
    QueryClient,
    HydrationBoundary,
    dehydrate,
} from "@tanstack/react-query"
import { getSkills } from "@/api/skillsApi"
import { getProjects } from "@/api/projectsApi"
import { getTechs } from "@/api/techsApi"
import { queryKeys } from "@/lib/queryKeys"
import { ReactNode, useEffect, useState } from "react"

interface PrefetchProviderProps {
    children: ReactNode
}

export function PrefetchProvider({ children }: PrefetchProviderProps) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 1000 * 60 * 5, // 5 minutes
                        refetchOnWindowFocus: false,
                    },
                },
            })
    )

    const [dehydratedState, setDehydratedState] = useState<ReturnType<
        typeof dehydrate
    > | null>(null)

    // useEffect(() => {
    //     const prefetchData = async () => {
    //         // Prefetch all data
    //         await Promise.all([
    //             queryClient.prefetchQuery({
    //                 queryKey: queryKeys.skills,
    //                 queryFn: getSkills,
    //             }),
    //             queryClient.prefetchQuery({
    //                 queryKey: queryKeys.projects,
    //                 queryFn: getProjects,
    //             }),
    //             queryClient.prefetchQuery({
    //                 queryKey: queryKeys.techs,
    //                 queryFn: getTechs,
    //             }),
    //         ])

    //         setDehydratedState(dehydrate(queryClient))
    //     }

    //     prefetchData()
    // }, [queryClient])

    if (!dehydratedState) {
        return <>{children}</>
    }

    return (
        <HydrationBoundary state={dehydratedState}>
            {children}
        </HydrationBoundary>
    )
}
