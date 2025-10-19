import { TechType } from "@/types/TechTypes"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export async function getTechs(): Promise<TechType[]> {
  const res = await fetch(`${API_URL}/api/techs`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })

  if (!res.ok) {
    throw new Error("Failed to fetch techs")
  }

  return res.json()
}
