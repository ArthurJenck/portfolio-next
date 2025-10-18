const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface Media {
    id: string
    alt?: string
    url: string
    filename: string
    mimeType: string
    filesize: number
    width?: number
    height?: number
    sizes?: {
        thumbnail?: {
            url: string
            width: number
            height: number
        }
        card?: {
            url: string
            width: number
            height: number
        }
        tablet?: {
            url: string
            width: number
            height: number
        }
    }
}

export interface Tech {
    id: string
    title: string
    icon?: string
    activeIcon?: string
    inactiveIcon?: string
    order: number
    active: boolean
}

export interface Project {
    id: string
    name: string
    date: string
    description: string
    technologies?: (Tech | string)[]
    githubLink?: string
    webLink?: string
    images?: (Media | string)[]
    createdAt: string
    updatedAt: string
}

export async function getProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/api/projects`, {
        next: { revalidate: 60 }, // Revalidate every 60 seconds
    })

    if (!response.ok) {
        throw new Error("Failed to fetch projects")
    }

    return response.json()
}

export async function getProject(id: string): Promise<Project> {
    const response = await fetch(`${API_URL}/api/projects/${id}`, {
        next: { revalidate: 60 },
    })

    if (!response.ok) {
        throw new Error("Failed to fetch project")
    }

    return response.json()
}
