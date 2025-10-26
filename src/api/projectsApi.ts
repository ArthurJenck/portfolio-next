import { ProjectResponse, DetailedProjectType } from '@/types/ProjectTypes'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''

export async function getProjects(): Promise<ProjectResponse> {
    const res = await fetch(`${API_URL}/api/projects`)

    if (!res.ok) {
        throw new Error('Failed to fetch projects')
    }

    return res.json()
}

// Pour le front - récupération par slug (URLs propres)
export async function getProject(slug: string): Promise<DetailedProjectType> {
    const res = await fetch(`${API_URL}/api/projects/slug/${slug}`)

    if (!res.ok) {
        throw new Error('Failed to fetch project')
    }

    return res.json()
}

// Pour l'admin - récupération par ID MongoDB
export async function getProjectById(id: string): Promise<DetailedProjectType> {
    const res = await fetch(`${API_URL}/api/projects/${id}`)

    if (!res.ok) {
        throw new Error('Failed to fetch project')
    }

    return res.json()
}
