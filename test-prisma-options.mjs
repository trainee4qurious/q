import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('Testing Prisma Question model...')
        // We don't need a real User to test the type validation in the create call
        // but Prisma might check FKs. So we'll just try to "validate" the arguments.

        // Attempting to use a type-safe way to check if 'options' is valid
        const data = {
            title: 'Test Form',
            userId: 'some-user-id', // This might fail FK but we care about the "Unknown argument" error
            questions: {
                create: [
                    {
                        type: 'text',
                        text: 'Test Question',
                        options: ['Opt 1', 'Opt 2'],
                        originalAnswer: 'Opt 1',
                        required: true,
                    }
                ]
            }
        }

        console.log('Sending data to prisma.form.create...')
        // We use a mock-like approach or just run it and catch the error
        // If it says "Unknown argument options", then it's a generation issue.
        // If it says "Foreign key constraint failed", then 'options' is VALID.
        await prisma.form.create({ data })

    } catch (error) {
        console.error('Prisma Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
