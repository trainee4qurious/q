// lib/auth.ts
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { cache } from 'react'

import { prisma } from './db'

const secret = process.env.JWT_SECRET
const isBuild = process.env.NEXT_PHASE === 'phase-production-build'

if (!secret && process.env.NODE_ENV === 'production' && !isBuild) {
  throw new Error('JWT_SECRET environment variable is required in production')
}

const JWT_SECRET = secret || 'fallback-secret-for-dev'

export const hashPassword = async (password: string) => {
    return await bcrypt.hash(password, 12)
}

export const comparePassword = async (password: string, hash: string) => {
    return await bcrypt.compare(password, hash)
}

export const signToken = (payload: any) => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export const verifyToken = (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET)
    } catch (error) {
        return null
    }
}

export const getSession = cache(async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    if (!token) return null
    const payload = verifyToken(token) as { userId: string; email: string; name?: string } | null
    if (!payload) return null

    return {
        id: payload.userId,
        email: payload.email,
        name: payload.name || null
    }
})
