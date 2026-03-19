// components/dashboard/DashboardHeader.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { User, LogOut, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/lib/store/use-ui-store'
import { ProfileModal } from './ProfileModal'
import { ThemeToggle } from '@/components/theme-toggle'

interface UserSession {
    id: string
    email: string
    name: string | null
}

export function DashboardHeader({ user }: { user: UserSession | null }) {
    const router = useRouter()
    const setIsCreateModalOpen = useUIStore((state) => state.setIsCreateModalOpen)
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/login')
        router.refresh()
    }

    return (
        <header className="border-b bg-background sticky top-0 z-40">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold">F</span>
                    </div>
                    <h1 className="text-xl font-bold text-foreground hidden sm:block">Formify</h1>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="flex items-center gap-2"
                        size="sm"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">Create Form</span>
                    </Button>

                    <ThemeToggle />

                    <div className="flex items-center gap-3 pl-4 border-l">
                        <div
                            className="flex flex-col items-end hidden sm:flex cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => setIsProfileModalOpen(true)}
                        >
                            <span className="text-sm font-medium text-foreground">
                                {user?.name || user?.email.split('@')[0] || 'User'}
                            </span>
                        </div>
                        <div
                            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
                            onClick={() => setIsProfileModalOpen(true)}
                        >
                            <User className="w-5 h-5 text-muted-foreground" />
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {user && (
                <ProfileModal
                    user={user}
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                />
            )}
        </header>
    )
}
