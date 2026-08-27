import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import bcrypt from 'bcryptjs'
import connectDB from './db/mongodb'
import User from '@/server/models/User'

// Coût de hachage bcrypt, partagé par les routes qui créent/mettent à jour un mot de passe.
export const BCRYPT_SALT_ROUNDS = 10

declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email?: string | null
            name?: string | null
            image?: string | null
        }
    }

    interface User {
        id: string
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id: string
    }
}

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null

                await connectDB()
                const user = await User.findOne({ email: credentials.email })

                if (!user) return null

                const isValid = await bcrypt.compare(credentials.password, user.password)
                if (!isValid) return null

                return { id: user._id.toString(), email: user.email }
            },
        }),
    ],
    pages: {
        signIn: '/admin',
    },
    session: {
        strategy: 'jwt',
    },
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        async jwt({ token, user }) {
            if (user) token.id = user.id
            return token
        },
        async session({ session, token }) {
            if (session.user) session.user.id = token.id as string
            return session
        },
    },
}

type AuthResult = { ok: true } | { ok: false; response: NextResponse }

export async function requireAuth(request: Request): Promise<AuthResult> {
    const session = await getServerSession(authOptions)
    if (session) return { ok: true }

    const envToken = process.env.ADMIN_API_TOKEN
    if (envToken) {
        const authHeader = request.headers.get('authorization') ?? ''
        const bearer = authHeader.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : ''
        if (bearer.length > 0) {
            const a = Buffer.from(bearer)
            const b = Buffer.from(envToken)
            const same = a.length === b.length && timingSafeEqual(a, b)
            if (same) return { ok: true }
        }
    }

    return { ok: false, response: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
}
