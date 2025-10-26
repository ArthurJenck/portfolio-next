'use client'

import { useQuery } from '@tanstack/react-query'
import { getSkills } from '@/api/skillsApi'
import { queryKeys } from '@/lib/queryKeys'

export function useSkills() {
    return useQuery({
        queryKey: queryKeys.skills,
        queryFn: getSkills,
        staleTime: 1000 * 60 * 60 * 24, // 1 journée
    })
}
