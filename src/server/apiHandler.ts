import { NextResponse } from 'next/server'
import { requireAuth } from './auth'
import connectDB from './db/mongodb'

type RouteContext<Params extends Record<string, string> = Record<string, never>> = {
    params: Promise<Params>
}

type RouteHandler<Params extends Record<string, string> = Record<string, never>> = (
    request: Request,
    context: RouteContext<Params>,
) => Promise<NextResponse>

interface RouteOptions {
    auth?: boolean
    db?: boolean
    errorMessage: string
}

// Enchaîne requireAuth (si demandé) -> connectDB (sauf opt-out) -> handler -> catch uniforme,
// pour que chaque route se réduise à sa logique métier.
export function route<Params extends Record<string, string> = Record<string, never>>(
    handler: RouteHandler<Params>,
    { auth = false, db = true, errorMessage }: RouteOptions,
) {
    return async (request: Request, context: RouteContext<Params>) => {
        if (auth) {
            const authResult = await requireAuth(request)
            if (!authResult.ok) return authResult.response
        }

        try {
            if (db) await connectDB()
            return await handler(request, context)
        } catch (error) {
            console.error(errorMessage, error)
            return NextResponse.json({ error: errorMessage }, { status: 500 })
        }
    }
}
