// app/register/page.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'

const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email(),
    password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof registerSchema>

export default function RegisterPage() {
    const router = useRouter()
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(registerSchema),
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (res.ok) {
                toast({ title: 'Account created successfully' })
                router.push('/dashboard')
                router.refresh()
            } else {
                let errorMessage = result.error || 'Check your details'
                if (result.error === 'user_exists') {
                    errorMessage = 'already registered log in'
                }

                toast({
                    title: 'Registration failed',
                    description: errorMessage,
                    variant: 'destructive'
                })
            }
        } catch (error) {
            toast({ title: 'Error creating account', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 relative">
            <div className="max-w-md w-full space-y-8 bg-card p-6 sm:p-8 rounded-xl shadow-lg border border-border">
                <div className="text-center">
                    <div className="inline-flex items-center justify-center w-12 h-12 bg-primary rounded-xl mb-4">
                        <span className="text-primary-foreground font-bold text-xl">F</span>
                    </div>
                    <h2 className="text-3xl font-extrabold text-foreground">Create an account</h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Start building beautiful forms today
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Full Name
                            </label>
                            <Input
                                {...register('name')}
                                placeholder="John Doe"
                                className={errors.name ? 'border-destructive' : 'bg-muted/50 border-input'}
                            />
                            {errors.name && (
                                <p className="text-destructive text-xs mt-1">{errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Email address
                            </label>
                            <Input
                                {...register('email')}
                                type="email"
                                placeholder="you@example.com"
                                className={errors.email ? 'border-destructive' : 'bg-muted/50 border-input'}
                            />
                            {errors.email && (
                                <p className="text-destructive text-xs mt-1">{errors.email.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-foreground mb-1">
                                Password
                            </label>
                            <Input
                                {...register('password')}
                                type="password"
                                placeholder="••••••••"
                                className={errors.password ? 'border-destructive' : 'bg-muted/50 border-input'}
                            />
                            {errors.password && (
                                <p className="text-destructive text-xs mt-1">{errors.password.message}</p>
                            )}
                        </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? 'Creating account...' : 'Create account'}
                    </Button>

                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition-colors underline underline-offset-4">
                                Log in here
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    )
}
