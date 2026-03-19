// app/api/auth/login/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { comparePassword, signToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string(),
})

export async function POST(req: Request) {
    try {
        const body = await req.json()
        const { email, password } = loginSchema.parse(body)

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user) {
            return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
        }

        const isMatch = await comparePassword(password, user.password)
        if (!isMatch) {
            return NextResponse.json({ error: 'wrong_password' }, { status: 401 })
        }

        const token = signToken({ userId: user.id, email: user.email, name: user.name })

        const response = NextResponse.json({ success: true, user: { id: user.id, email: user.email, name: user.name } })
        response.cookies.set('auth-token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
        })

        return response
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
