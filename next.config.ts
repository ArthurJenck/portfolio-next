import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    sassOptions: {
        silenceDeprecations: ['legacy-js-api'],
    },
    images: {
        formats: ['image/avif', 'image/webp'],
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '**.public.blob.vercel-storage.com',
            },
        ],
    },
}

export default nextConfig
