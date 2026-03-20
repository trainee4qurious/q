'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { getSession } from '@/lib/auth'

export async function uploadFile(formData: FormData) {
    try {
        const session = await getSession()
        if (!session) {
            return { success: false, error: 'Unauthorized: You must be logged in to upload files.' }
        }

        const file = formData.get('file') as File
        if (!file) {
            return { success: false, error: 'No file provided' }
        }

        // Basic file type validation
        const allowedExtensions = ['jpg', 'jpeg', 'png', 'webp', 'pdf']
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
            return { success: false, error: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}` }
        }

        // Limit file size (e.g., 5MB)
        const MAX_SIZE = 5 * 1024 * 1024
        if (file.size > MAX_SIZE) {
            return { success: false, error: 'File size exceeds the 5MB limit.' }
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure uploads directory exists
        const uploadsDir = join(process.cwd(), 'public', 'uploads')
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true })
        }

        // Generate unique filename
        const uniqueId = Date.now() + '-' + Math.round(Math.random() * 1e9)
        const filename = `${uniqueId}-${file.name.replace(/[^\w.-]/g, '-')}`
        const path = join(uploadsDir, filename)

        // Write file to disk
        await writeFile(path, buffer)

        // Return the public URL path via the new API route
        const publicUrl = `/api/uploads/${filename}`

        return { success: true, url: publicUrl }
    } catch (error) {
        console.error('Error uploading file:', error)
        return { success: false, error: 'Failed to upload file' }
    }
}
