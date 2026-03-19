// components/dashboard/FormCard.tsx
'use client'

import { useState } from 'react'
import { MoreVertical, Edit2, Trash2, Copy, ExternalLink, Files } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { deleteForm, duplicateForm } from '@/app/actions/form-actions'
import { useToast } from '@/hooks/use-toast'
import { useUIStore } from '@/lib/store/use-ui-store'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface FormCardProps {
    form: {
        id: string
        title: string
        description?: string | null
        createdAt: Date
        responsesCount: number
    }
}

export function FormCard({ form }: FormCardProps) {
    const { toast } = useToast()
    const [isDeleting, setIsDeleting] = useState(false)

    const handleCopyLink = () => {
        const url = `${window.location.origin}/form/${form.id}`
        navigator.clipboard.writeText(url)
        toast({
            title: 'Link Copied',
            description: 'The form link has been copied to your clipboard.',
        })
    }

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this form?')) return
        setIsDeleting(true)
        try {
            await deleteForm(form.id)
            toast({ title: 'Form deleted' })
        } catch (error) {
            toast({ title: 'Error deleting form', variant: 'destructive' })
        } finally {
            setIsDeleting(false)
        }
    }

    const handleDuplicate = async () => {
        try {
            await duplicateForm(form.id)
            toast({ title: 'Form duplicated' })
        } catch (error) {
            toast({ title: 'Error duplicating form', variant: 'destructive' })
        }
    }

    return (
        <Card className="hover:shadow-md transition-shadow group">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold truncate pr-4">
                        {form.title}
                    </CardTitle>
                    <div className="opacity-100 transition-opacity">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-40 bg-background border border-border mt-1">
                                <DropdownMenuItem
                                    onClick={() => {
                                        useUIStore.getState().setSelectedFormId(form.id)
                                        useUIStore.getState().setIsCreateModalOpen(true)
                                    }}
                                    className="cursor-pointer gap-2"
                                >
                                    <Edit2 className="h-4 w-4" />
                                    <span>Edit</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleDuplicate} className="cursor-pointer gap-2">
                                    <Files className="h-4 w-4" />
                                    <span>Duplicate</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer gap-2">
                                    <Copy className="h-4 w-4" />
                                    <span>Copy Link</span>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={handleDelete}
                                    className="cursor-pointer gap-2 text-destructive focus:text-destructive focus:bg-destructive/10"
                                    disabled={isDeleting}
                                >
                                    <Trash2 className="h-4 w-4" />
                                    <span>Delete</span>
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[2.5rem]">
                    {form.description || 'No description provided.'}
                </p>
            </CardHeader>
            <CardContent className="pb-3 mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{form.responsesCount} responses</span>
                    <span suppressHydrationWarning>{formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })}</span>
                </div>
            </CardContent>
            <CardFooter className="pt-3 border-t bg-muted/50 flex flex-wrap justify-end gap-2 px-4 py-2">
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs gap-1 opacity-60 hover:opacity-100 transition-opacity"
                    onClick={() => window.open(`/form/${form.id}`, '_blank')}
                >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Preview
                </Button>
                <div className="flex-1" />
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => {
                        useUIStore.getState().setSelectedFormId(form.id)
                        useUIStore.getState().setIsCreateModalOpen(true)
                    }}
                >
                    <Edit2 className="h-3.5 w-3.5" />
                    Edit
                </Button>
            </CardFooter>
        </Card>
    )
}
