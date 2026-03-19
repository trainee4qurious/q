// components/dashboard/ProfileModal.tsx
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { updateUserProfile } from '@/app/actions/user-actions'

const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
})

type FormData = z.infer<typeof profileSchema>

interface ProfileModalProps {
    user: {
        id: string
        name: string | null
        email: string
    }
    isOpen: boolean
    onClose: () => void
}

export function ProfileModal({ user, isOpen, onClose }: ProfileModalProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            name: user.name || '',
            email: user.email,
        },
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            await updateUserProfile(data)
            toast({ title: 'Profile updated successfully' })
            onClose()
        } catch (error) {
            toast({
                title: 'Error updating profile',
                description: error instanceof Error ? error.message : 'Something went wrong',
                variant: 'destructive',
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-background border border-border">
                <DialogHeader>
                    <DialogTitle>Edit Profile</DialogTitle>
                    <DialogDescription>
                        Make changes to your profile here. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            {...register('name')}
                            className={errors.name ? 'border-destructive' : 'bg-muted/50 border-input'}
                        />
                        {errors.name && (
                            <p className="text-destructive text-xs">{errors.name.message}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            {...register('email')}
                            className={errors.email ? 'border-destructive' : 'bg-muted/50 border-input'}
                        />
                        {errors.email && (
                            <p className="text-destructive text-xs">{errors.email.message}</p>
                        )}
                    </div>
                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading ? 'Saving...' : 'Save changes'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
