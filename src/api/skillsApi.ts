const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface Skill {
    id: string
    category: "Front-end" | "Back-end" | "Outils"
    name: string
    icon?: string
    description?: string
    createdAt: string
    updatedAt: string
}

export async function getSkills(): Promise<Skill[]> {
    const response = await fetch(`${API_URL}/api/skills`, {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!response.ok) {
        throw new Error("Failed to fetch skills")
    }

    return response.json()
}
