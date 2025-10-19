import { SkillType } from "@/types/SkillsTypes"

const API_URL = process.env.NEXT_PUBLIC_API_URL || ""

export async function getSkills(): Promise<SkillType[]> {
  const res = await fetch(`${API_URL}/api/skills`, {
    next: { revalidate: 60 }, // Revalidate every 60 seconds
  })

  if (!res.ok) {
    throw new Error("Failed to fetch skills")
  }

  return res.json()
}
