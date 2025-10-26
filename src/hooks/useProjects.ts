'use client'

import { useQuery } from '@tanstack/react-query'
import { getProjects, getProject } from '@/api/projectsApi'
import { queryKeys } from '@/lib/queryKeys'

export function useProjects() {
    return useQuery({
        queryKey: queryKeys.projects,
        queryFn: getProjects,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}

export function useProject(slug: string) {
    return useQuery({
        queryKey: queryKeys.project(slug),
        queryFn: () => getProject(slug),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!slug,
    })
}
