import { NextResponse } from "next/server"
import { getPayloadHMR } from "@payloadcms/next/utilities"
import configPromise from "@payload-config"

export async function GET() {
    try {
        const payload = await getPayloadHMR({ config: configPromise })

        const projects = await payload.find({
            collection: "projects",
            depth: 2,
            limit: 100,
        })

        return NextResponse.json(projects.docs)
    } catch (error) {
        console.error("Error fetching projects:", error)
        return NextResponse.json(
            { error: "Failed to fetch projects" },
            { status: 500 }
        )
    }
}
