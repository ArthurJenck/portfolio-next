import { NextResponse } from 'next/server'
import { route } from '@/server/apiHandler'
import { BCRYPT_SALT_ROUNDS } from '@/server/auth'
import User from '@/server/models/User'
import bcrypt from 'bcryptjs'

export const GET = route(
    async () => {
        const users = await User.find().select('-password').sort({ createdAt: -1 })

        return NextResponse.json(users)
    },
    { auth: true, errorMessage: 'Failed to fetch users' },
)

export const POST = route(
    async (request) => {
        const body = await request.json()

        // Hash password before saving
        if (body.password) {
            body.password = await bcrypt.hash(body.password, BCRYPT_SALT_ROUNDS)
        }

        const user = await User.create(body)
        const userResponse = user.toObject()
        delete userResponse.password

        return NextResponse.json(userResponse, { status: 201 })
    },
    { auth: true, errorMessage: 'Failed to create user' },
)
