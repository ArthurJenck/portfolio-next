import { NextResponse } from "next/server"
import { getPayloadHMR } from "@payloadcms/next/utilities"
import configPromise from "@payload-config"

export async function GET() {
    try {
        const payload = await getPayloadHMR({ config: configPromise })

        const skills = await payload.find({
            collection: "skills",
            limit: 100,
        })

        return NextResponse.json(skills.docs)
    } catch (error) {
        console.error("Error fetching skills:", error)
        return NextResponse.json(
            { error: "Failed to fetch skills" },
            { status: 500 }
        )
    }
}
