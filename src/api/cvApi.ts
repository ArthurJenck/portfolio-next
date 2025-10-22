export interface CVResponse {
    id: string
    url: string
    fileName: string
    customName: string
    uploadedAt: string
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function getCV(): Promise<CVResponse> {
    const res = await fetch(`${API_URL}/api/cv`)

    if (!res.ok) {
        throw new Error('Failed to fetch CV')
    }

    return res.json()
}
