// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import * as jose from 'jose'

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'fallback-secret-for-dev'
)

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('auth-token')?.value

    if (request.nextUrl.pathname.startsWith('/dashboard')) {
        if (!token) {
            return NextResponse.redirect(new URL('/login', request.url))
        }

        try {
            await jose.jwtVerify(token, JWT_SECRET)
            return NextResponse.next()
        } catch (e) {
            return NextResponse.redirect(new URL('/login', request.url))
        }
    }

    return NextResponse.next()

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
}
