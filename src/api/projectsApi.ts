import { ProjectType } from "@/types/ProjectTypes"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export async function getProjects(): Promise<ProjectType[]> {
  const res = await fetch(`${API_URL}/api/projects`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })

  if (!res.ok) {
    throw new Error("Failed to fetch projects")
  }

  return res.json()
}

export async function getProject(id: string): Promise<ProjectType> {
  const res = await fetch(`${API_URL}/api/projects/${id}`, {
    next: { revalidate: 60 },
  })

  if (!res.ok) {
    throw new Error("Failed to fetch project")
  }

  return res.json()
}
