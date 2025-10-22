'use client'

import { useQuery } from '@tanstack/react-query'
import { getCV } from '@/api/cvApi'
import { queryKeys } from '@/lib/queryKeys'

export function useCV() {
    return useQuery({
        queryKey: queryKeys.cv,
        queryFn: getCV,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
