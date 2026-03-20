// app/actions/form-actions.ts
'use server'

import { prisma } from '@/lib/db'
import { getSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { redirect } from 'next/navigation'
import { QuestionType } from '@/types/form-submission'

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
    id: z.string().optional(),
})

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    questions: z.array(questionSchema).optional(),
    lockMode: z.boolean().default(false),
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
            lockMode: data.lockMode || false,
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
        } as any,
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
            lockMode: data.lockMode ?? (existingForm as any).lockMode,
            questions: questions ? {
                // Better approach: Synchronize questions instead of deleteMany/create
                // For simplicity here, we stick to the pattern but try to preserve IDs if provided
                deleteMany: {},
                create: questions.map((q) => ({
                    id: q.id, // Preserving ID if it exists
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
            } : undefined,
        } as any,
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

export async function getFormResponses(formId: string, options?: {
    page?: number;
    limit?: number;
    sortBy?: 'createdAt' | 'score';
    sortOrder?: 'asc' | 'desc';
    minScore?: number;
    maxScore?: number;
}) {
    const session = await getSession()
    if (!session) redirect('/login')

    const page = options?.page ?? 1
    const limit = options?.limit ?? 20
    const skip = (page - 1) * limit
    const sortBy = options?.sortBy ?? 'createdAt'
    const sortOrder = options?.sortOrder ?? 'desc'

    const where: any = { formId }
    if (options?.minScore !== undefined) {
        where.score = { ...(where.score || {}), gte: options.minScore }
    }
    if (options?.maxScore !== undefined) {
        where.score = { ...(where.score || {}), lte: options.maxScore }
    }

    const [form, responses, totalCount] = await Promise.all([
        prisma.form.findUnique({
            where: { id: formId },
            include: {
                questions: {
                    orderBy: { page: 'asc' }
                }
            }
        }),
        prisma.formResponse.findMany({
            where,
            orderBy: { [sortBy]: sortOrder },
            skip,
            take: limit
        }),
        prisma.formResponse.count({ where })
    ])

    if (!form || form.userId !== session.id) {
        throw new Error('Form not found or unauthorized')
    }

    return {
        ...form,
        responses,
        pagination: {
            total: totalCount,
            page,
            limit,
            totalPages: Math.ceil(totalCount / limit)
        }
    }
}

export async function getPublicForm(id: string) {
    const form = await prisma.form.findUnique({
        where: { id },
        include: { questions: true },
    })

    if (!form) return null

    // Map Prisma questions to the format expected by the frontend
    const questions = form.questions.map((q, index) => ({
        id: q.id,
        step: q.page,
        question: q.text,
        description: "", // Prisma model doesn't have description yet
        imageUrl: q.imageUrl || undefined,
        questiontype: q.type as QuestionType,
        options: (q.options as any[])?.map(opt => ({
            label: opt.text,
            value: opt.text,
            image: opt.imageUrl,
            points: opt.points || 0
        })) || [],
        required: q.required,
        order: index,
        active: true,
        points: q.points,
        originalAnswer: q.originalAnswer || ""
    }))

    return {
        ...form,
        questions,
        lockMode: (form as any).lockMode
    }
}

export async function submitFormResponse(formId: string, data: any, score?: number, tabSwitches: number = 0) {
    try {
        const response = await prisma.formResponse.create({
            data: {
                formId,
                data,
                score,
                tabSwitches,
            }
        })

        // Increment responsesCount
        await prisma.form.update({
            where: { id: formId },
            data: {
                responsesCount: {
                    increment: 1
                }
            }
        })

        revalidatePath(`/dashboard`)
        revalidatePath(`/f/${formId}`)
        revalidatePath(`/f/${formId}/result/success`)
        revalidatePath(`/f/${formId}/result/failure`)

        return { success: true, id: response.id }
    } catch (error) {
        console.error('Submission error:', error)
        return { success: false, error: 'Failed to submit response' }
    }
}

export async function deleteResponse(responseId: string) {
    const session = await getSession()
    if (!session) redirect('/login')

    try {
        const response = await prisma.formResponse.findUnique({
            where: { id: responseId },
            include: { form: true }
        })

        if (!response || response.form.userId !== session.id) {
            throw new Error('Response not found or unauthorized')
        }

        await prisma.formResponse.delete({ where: { id: responseId } })

        // Decrement responsesCount
        await prisma.form.update({
            where: { id: response.formId },
            data: {
                responsesCount: {
                    decrement: 1
                }
            }
        })

        revalidatePath(`/dashboard/responses/${response.formId}`)
        return { success: true }
    } catch (error) {
        console.error('Delete response error:', error)
        return { success: false, error: 'Failed to delete response' }
    }
}

export async function deleteAllResponses(formId: string) {
    const session = await getSession()
    if (!session) redirect('/login')

    try {
        const form = await prisma.form.findUnique({
            where: { id: formId }
        })

        if (!form || form.userId !== session.id) {
            throw new Error('Form not found or unauthorized')
        }

        await prisma.formResponse.deleteMany({
            where: { formId }
        })

        // Reset responsesCount
        await prisma.form.update({
            where: { id: formId },
            data: {
                responsesCount: 0
            }
        })

        revalidatePath(`/dashboard/responses/${formId}`)
        return { success: true }
    } catch (error) {
        console.error('Delete all responses error:', error)
        return { success: false, error: 'Failed to delete all responses' }
    }
}

