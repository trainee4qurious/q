// app/actions/form-actions.ts
'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { redirect } from 'next/navigation'

const questionSchema = z.object({
    type: z.enum(['text', 'email', 'number', 'phone', 'radio', 'checkbox', 'textarea', 'dropdown', 'file']),
    text: z.string().min(1, 'Question text is required'),
    points: z.number().default(0),
    imageUrl: z.string().optional(),
    options: z.array(z.object({
        text: z.string(),
        imageUrl: z.string().optional(),
    })).optional(),
    originalAnswer: z.string().optional(),
    required: z.boolean().default(true),
    validation: z.string().optional(),
    page: z.number().min(1).default(1),
})

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    questions: z.array(questionSchema).optional(),
})

export async function getForms() {
    const session = await getSession()
    if (!session) redirect('/login')

    return await prisma.form.findMany({
        where: { userId: session.id },
        include: { questions: true },
        orderBy: { createdAt: 'desc' },
    })
}

export async function getFormById(id: string) {
    const session = await getSession()
    if (!session) redirect('/login')

    const form = await prisma.form.findUnique({
        where: { id },
        include: { questions: true },
    })

    if (!form || form.userId !== session.id) {
        throw new Error('Form not found or unauthorized')
    }

    return form
}

export async function createForm(data: z.infer<typeof formSchema>) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { title, description, questions } = formSchema.parse(data)

    const form = await prisma.form.create({
        data: {
            title,
            description,
            userId: session.id,
            questions: {
                create: questions?.map((q) => ({
                    type: q.type,
                    text: q.text,
                    points: q.points,
                    imageUrl: q.imageUrl,
                    options: q.options || [],
                    originalAnswer: q.originalAnswer,
                    required: q.required,
                    validation: q.validation,
                    page: q.page,
                })),
            },
        },
        include: { questions: true },
    })

    revalidatePath('/dashboard')
    return form
}

export async function updateForm(id: string, data: z.infer<typeof formSchema>) {
    const session = await getSession()
    if (!session) redirect('/login')

    const { title, description, questions } = formSchema.parse(data)

    const existingForm = await prisma.form.findUnique({ where: { id } })
    if (!existingForm || existingForm.userId !== session.id) {
        throw new Error('Form not found or unauthorized')
    }

    const form = await prisma.form.update({
        where: { id },
        data: {
            title,
            description,
            questions: {
                deleteMany: {}, // Delete all existing questions associated with this form
                create: questions?.map((q) => ({
                    type: q.type,
                    text: q.text,
                    points: q.points,
                    imageUrl: q.imageUrl,
                    options: q.options || [],
                    originalAnswer: q.originalAnswer,
                    required: q.required,
                    validation: q.validation,
                    page: q.page,
                })),
            },
        },
        include: { questions: true },
    })

    revalidatePath('/dashboard')
    return form
}

export async function deleteForm(id: string) {
    const session = await getSession()
    if (!session) redirect('/login')

    const existingForm = await prisma.form.findUnique({ where: { id } })
    if (!existingForm || existingForm.userId !== session.id) {
        throw new Error('Form not found or unauthorized')
    }

    await prisma.form.delete({ where: { id } })

    revalidatePath('/dashboard')
    return { success: true }
}

export async function duplicateForm(id: string) {
    const session = await getSession()
    if (!session) redirect('/login')

    const existingForm = await prisma.form.findUnique({
        where: { id },
        include: { questions: true },
    })
    if (!existingForm || existingForm.userId !== session.id) {
        throw new Error('Form not found or unauthorized')
    }

    const duplicatedForm = await prisma.form.create({
        data: {
            title: `${existingForm.title} (Copy)`,
            description: existingForm.description,
            userId: session.id,
            questions: {
                create: (existingForm.questions || []).map((q) => ({
                    type: q.type,
                    text: q.text,
                    points: q.points,
                    imageUrl: q.imageUrl,
                    options: q.options ?? [],
                    originalAnswer: q.originalAnswer,
                    required: q.required,
                    validation: q.validation,
                    page: q.page,
                })),
            },
            responsesCount: 0,
        },
        include: { questions: true },
    })

    revalidatePath('/dashboard')
    return duplicatedForm
}
