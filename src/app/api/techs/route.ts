import { NextResponse } from "next/server"
import { getPayloadHMR } from "@payloadcms/next/utilities"
import configPromise from "@payload-config"

export async function GET() {
    try {
        const payload = await getPayloadHMR({ config: configPromise })

        const techs = await payload.find({
            collection: "techs",
            limit: 100,
            sort: "order",
        })

        return NextResponse.json(techs.docs)
    } catch (error) {
        console.error("Error fetching techs:", error)
        return NextResponse.json(
            { error: "Failed to fetch techs" },
            { status: 500 }
        )
    }
}
