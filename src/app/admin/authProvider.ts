'use client'

import { AuthProvider } from 'react-admin'
import { signIn, signOut } from 'next-auth/react'

export default {
    login: ({ username, password }) => {
        return signIn('credentials', {
            email: username,
            password,
            redirect: false,
        }).then((result) => {
            if (result?.error) {
                return Promise.reject()
            }
            return Promise.resolve()
        })
    },
    logout: () => {
        return signOut({ redirect: false }).then(() => Promise.resolve())
    },
    checkAuth: () => {
        // Check if user is authenticated via NextAuth
        return fetch('/api/auth/session')
            .then((res) => res.json())
            .then((session) => {
                if (session?.user) {
                    return Promise.resolve()
                }
                return Promise.reject()
            })
    },
    checkError: (error) => {
        const status = error.status
        if (status === 401 || status === 403) {
            return Promise.reject()
        }
        return Promise.resolve()
    },
    getPermissions: () => Promise.resolve(),
} as AuthProvider
