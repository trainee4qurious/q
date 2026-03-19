// app/actions/user-actions.ts
'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
})

export async function updateUserProfile(data: z.infer<typeof profileSchema>) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { name, email } = profileSchema.parse(data)

    // Check if email is already taken by another user
    if (email !== session.email) {
        const existingUser = await prisma.user.findUnique({ where: { email } })
        if (existingUser) {
            throw new Error('Email already in use')
        }
    }

    const user = await prisma.user.update({
        where: { id: session.id },
        data: { name, email },
    })

    revalidatePath('/dashboard')
    return { success: true, user: { id: user.id, name: user.name, email: user.email } }
}
