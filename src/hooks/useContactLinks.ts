'use client'

import { useQuery } from '@tanstack/react-query'
import { getContactLinks } from '@/api/contactLinksApi'
import { queryKeys } from '@/lib/queryKeys'

export function useContactLinks() {
    return useQuery({
        queryKey: queryKeys.contactLinks,
        queryFn: getContactLinks,
        staleTime: 1000 * 60 * 60 * 24, // 1 journée
    })
}
