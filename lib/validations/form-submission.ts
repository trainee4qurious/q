import { z } from 'zod'
import { Question } from '@/types/form-submission'

export function generateStepSchema(questions: Question[]) {
    const schemaFields: Record<string, any> = {}

    questions.forEach((q) => {
        let fieldSchema: any = z.any()

        switch (q.questiontype) {
            case 'input':
            case 'textarea':
            case 'text':
            case 'kyc':
            case 'email':
            case 'mail':
                fieldSchema = z.string().trim()
                if (q.questiontype === 'email' || q.questiontype === 'mail') {
                    fieldSchema = fieldSchema.email(`${q.question} must be a valid email address`)
                }

                // Disallow numbers in Name and Role fields
                const isNameOrRole = q.question.toLowerCase().includes('name') ||
                    q.question.toLowerCase().includes('role')
                if (isNameOrRole) {
                    fieldSchema = fieldSchema.regex(/^[^0-9]*$/, `${q.question} cannot contain numbers`)
                }

                if (String(q.required).toLowerCase() === 'yes' || q.required === true) {
                    fieldSchema = fieldSchema.min(1, `${q.question} is required`)
                }

                if (q.minlength) {
                    fieldSchema = fieldSchema.min(Number(q.minlength), `${q.question} must be at least ${q.minlength} characters`)
                }
                if (q.maxlength) {
                    fieldSchema = fieldSchema.max(Number(q.maxlength), `${q.question} must be at most ${q.maxlength} characters`)
                }
                break
            case 'dropdown':
            case 'select':
            case 'radio':
            case 'choice':
                fieldSchema = z.string()
                if (String(q.required).toLowerCase() === 'yes' || q.required === true) {
                    fieldSchema = fieldSchema.min(1, `Please select an option for ${q.question}`)
                }
                break
            case 'checkbox':
            case 'multi':
                fieldSchema = z.array(z.string())
                if (String(q.required).toLowerCase() === 'yes' || q.required === true) {
                    fieldSchema = fieldSchema.min(1, `Please select at least one option for ${q.question}`)
                }
                break
        }

        schemaFields[q.id] = fieldSchema
    })

    return z.object(schemaFields)
}

export function getDefaultValues(questions: Question[], existingData: any = {}) {
    const defaults: Record<string, any> = {}

    questions.forEach((q) => {
        const id = String(q.id)
        if (existingData[id] !== undefined) {
            defaults[id] = existingData[id]
            return
        }

        switch (q.questiontype) {
            case 'checkbox':
            case 'multi':
                defaults[id] = []
                break
            default:
                defaults[id] = ""
                break
        }
    })

    return defaults
}
