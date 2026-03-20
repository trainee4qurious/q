'use client'

import { useState } from 'react'
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { deleteResponse, deleteAllResponses } from '@/app/actions/form-actions'
import { useToast } from '@/hooks/use-toast'

interface DeleteResponseButtonProps {
    responseId: string
}

export function DeleteResponseButton({ responseId }: DeleteResponseButtonProps) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteResponse(responseId)
            if (result.success) {
                toast({
                    title: "Success",
                    description: "Response deleted successfully",
                })
                setOpen(false)
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete response",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle className="h-5 w-5" />
                        <DialogTitle>Delete Response</DialogTitle>
                    </div>
                    <DialogDescription>
                        Are you sure you want to delete this response? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

interface DeleteAllResponsesButtonProps {
    formId: string
    disabled?: boolean
}

export function DeleteAllResponsesButton({ formId, disabled }: DeleteAllResponsesButtonProps) {
    const [open, setOpen] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const { toast } = useToast()

    const handleDeleteAll = async () => {
        setIsDeleting(true)
        try {
            const result = await deleteAllResponses(formId)
            if (result.success) {
                toast({
                    title: "Success",
                    description: "All responses deleted successfully",
                })
                setOpen(false)
            } else {
                toast({
                    title: "Error",
                    description: result.error || "Failed to delete all responses",
                    variant: "destructive",
                })
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "An unexpected error occurred",
                variant: "destructive",
            })
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="gap-2 text-destructive hover:bg-destructive/10 border-destructive/20" disabled={disabled}>
                    <Trash2 className="h-4 w-4" />
                    Delete All
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <div className="flex items-center gap-2 text-destructive mb-2">
                        <AlertTriangle className="h-6 w-6" />
                        <DialogTitle>Delete All Responses</DialogTitle>
                    </div>
                    <DialogDescription className="text-base">
                        This will permanently delete <strong>all</strong> responses for this form.
                        This action is irreversible.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mt-4 gap-2 sm:gap-0">
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={isDeleting}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={handleDeleteAll} disabled={isDeleting} className="px-8">
                        {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Delete All
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
