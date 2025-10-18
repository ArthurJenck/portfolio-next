import { NextResponse } from "next/server"
import { getPayloadHMR } from "@payloadcms/next/utilities"
import configPromise from "@payload-config"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const payload = await getPayloadHMR({ config: configPromise })

        const project = await payload.findByID({
            collection: "projects",
            id: id,
            depth: 2,
        })

        return NextResponse.json(project)
    } catch (error) {
        console.error("Error fetching project:", error)
        return NextResponse.json(
            { error: "Failed to fetch project" },
            { status: 500 }
        )
    }
}
