// app/form/[id]/page.tsx
import { prisma } from '@/lib/db'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface FormPageProps {
    params: Promise<{ id: string }>
}

export default async function FormPage({ params }: FormPageProps) {
    const { id } = await params

    const form = await prisma.form.findUnique({
        where: { id },
    })

    if (!form) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8 relative">
            <div className="max-w-2xl mx-auto">
                <header className="mb-8 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                            <span className="text-primary-foreground font-bold text-2xl">F</span>
                        </div>
                    </div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">Formify</h1>
                </header>

                <Card className="shadow-lg border border-border bg-card">
                    <CardHeader className="space-y-4 pb-8 border-b border-border">
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {form.title}
                        </CardTitle>
                        {form.description && (
                            <p className="text-muted-foreground text-lg leading-relaxed">
                                {form.description}
                            </p>
                        )}
                    </CardHeader>
                    <CardContent className="pt-8">
                        <div className="flex flex-col items-center justify-center py-12 text-center bg-muted/30 rounded-lg border-2 border-dashed border-border">
                            <p className="text-muted-foreground font-medium">
                                The form fields will appear here soon.
                            </p>
                            <p className="text-sm text-muted-foreground/60 mt-2">
                                This is just a preview of the form title and description.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                <footer className="mt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Formify. All rights reserved.</p>
                </footer>
            </div>
        </div>
    )
}
