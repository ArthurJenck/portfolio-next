import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import { BCRYPT_SALT_ROUNDS } from '@/server/auth'
import User from '@/server/models/User'
import bcrypt from 'bcryptjs'

export const GET = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const user = await User.findById(id).select('-password')

        if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(user)
    },
    { auth: true, errorMessage: 'Failed to fetch user' },
)

export const PUT = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const body = await request.json()

        // Hash password if it's being updated
        if (body.password) {
            body.password = await bcrypt.hash(body.password, BCRYPT_SALT_ROUNDS)
        }

        const user = await User.findByIdAndUpdate(id, body, { new: true }).select('-password')

        if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json(user)
    },
    { auth: true, errorMessage: 'Failed to update user' },
)

export const DELETE = route<{ id: string }>(
    async (request, { params }) => {
        const { id } = await params
        const user = await User.findByIdAndDelete(id)

        if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 })
        return NextResponse.json({ success: true })
    },
    { auth: true, errorMessage: 'Failed to delete user' },
)
