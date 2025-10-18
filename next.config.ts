import type { NextConfig } from "next"
import { withPayload } from "@payloadcms/next/withPayload"

const nextConfig: NextConfig = {
    sassOptions: {
        silenceDeprecations: ["legacy-js-api"],
    },
}

export default withPayload(nextConfig)
