// app/dashboard/page.tsx
import { DashboardHeader } from '@/components/dashboard/DashboardHeader'
import { FormList } from '@/components/dashboard/FormList'
import { CreateFormModal } from '@/components/dashboard/CreateFormModal'
import { getForms } from '@/app/actions/form-actions'
import { getSession } from '@/lib/auth'
import { Toaster } from '@/components/ui/toaster'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export default async function DashboardPage() {
    const session = await getSession()

    if (!session) {
        redirect('/login')
    }

    const forms = await getForms()

    return (
        <div className="min-h-screen bg-background">
            <DashboardHeader user={session} />

            <main className="container mx-auto px-4 py-8">
                <div className="flex flex-col gap-8">
                    <div>
                        <h2 className="text-2xl font-bold text-foreground">Your Forms</h2>
                        <p className="text-muted-foreground">Manage and view responses for your forms.</p>
                    </div>

                    <FormList forms={forms} />
                </div>
            </main>

            <CreateFormModal />
            <Toaster />
        </div>
    )
}
