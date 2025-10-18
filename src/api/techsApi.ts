const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface Tech {
  id: string
  title: string
  icon?: string
  activeIcon?: string
  inactiveIcon?: string
  order: number
  active: boolean
  createdAt: string
  updatedAt: string
}

export async function getTechs(): Promise<Tech[]> {
  const response = await fetch(`${API_URL}/api/techs`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })

  if (!response.ok) {
    throw new Error("Failed to fetch techs")
  }

  const data = await response.json()

  // Transform MongoDB _id to id
  return data.map((tech: any) => ({
    ...tech,
    id: tech._id || tech.id,
  }))
}
