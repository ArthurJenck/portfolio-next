import { QueryClient } from '@tanstack/react-query'

const makeQueryClient = () => {
    return new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 minutes
                gcTime: 1000 * 60 * 5, // 5 minutes
                refetchOnMount: (query) => {
                    return query.state.data === null
                },
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
                retry: false,
            },
        },
    })
}

let browserQueryClient: QueryClient | null = null

export const getQueryClient = () => {
    if (typeof window === 'undefined') {
        return makeQueryClient()
    }

    if (!browserQueryClient) {
        browserQueryClient = makeQueryClient()
    }
    return browserQueryClient
}
