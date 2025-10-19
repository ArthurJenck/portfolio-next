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

export function useProject(id: string) {
    return useQuery({
        queryKey: queryKeys.project(id),
        queryFn: () => getProject(id),
        staleTime: 1000 * 60 * 5, // 5 minutes
        enabled: !!id,
    })
}
