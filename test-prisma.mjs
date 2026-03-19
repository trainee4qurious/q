import { PrismaClient } from '@prisma/client'
try {
    const prisma = new PrismaClient()
    console.log('Successfully instantiated PrismaClient')
    process.exit(0)
} catch (e) {
    console.error('Failed to instantiate PrismaClient:', e)
    process.exit(1)
}
