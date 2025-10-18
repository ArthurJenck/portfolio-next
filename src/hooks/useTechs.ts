"use client"

import { useQuery } from "@tanstack/react-query"
import { getTechs } from "@/api/techsApi"
import { queryKeys } from "@/lib/queryKeys"

export function useTechs() {
    return useQuery({
        queryKey: queryKeys.techs,
        queryFn: getTechs,
        staleTime: 1000 * 60 * 5, // 5 minutes
    })
}
