'use client'

import { useForm, useFieldArray, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState, useRef, useCallback, useEffect, useMemo } from 'react'
import { useUIStore } from '@/lib/store/use-ui-store'
import { createForm, getFormById, updateForm } from '@/app/actions/form-actions'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
import type { Question } from '@prisma/client'
import { QuestionCard } from './form-builder/QuestionCard'

const questionSchema = z.object({
    type: z.enum(['text', 'email', 'number', 'phone', 'radio', 'checkbox', 'textarea', 'dropdown', 'file']),
    text: z.string().min(1, 'Question text is required'),
    points: z.number().min(0, 'Points must be >= 0'),
    imageUrl: z.string().optional(),
    options: z.array(z.object({
        text: z.string(),
        imageUrl: z.string().optional(),
    })).optional(),
    originalAnswer: z.string().optional(),
    required: z.boolean(),
    validation: z.string().optional(),
    page: z.number().min(1, 'Page must be >= 1'),
    id: z.string().optional(),
})

const formSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    description: z.string().optional(),
    questions: z.array(questionSchema).min(1, 'At least one question is required'),
    lockMode: z.boolean(),
})

type FormData = z.infer<typeof formSchema>

export function CreateFormModal() {
    const { toast } = useToast()
    const { isCreateModalOpen, setIsCreateModalOpen, selectedFormId, setSelectedFormId } = useUIStore()
    const [isLoading, setIsLoading] = useState(false)
    const [isFetching, setIsFetching] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeQuestionIndex, setActiveQuestionIndex] = useState<number | null>(null)
    const [activeOptionIndex, setActiveOptionIndex] = useState<{ qIdx: number, optIdx: number } | null>(null)

    const methods = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            title: '',
            description: '',
            lockMode: false,
            questions: [{ type: 'text', text: '', points: 0, options: [{ text: 'Option 1' }], originalAnswer: '', required: true, page: 1 }],
        },
    })

    const { register, control, handleSubmit, reset, setValue, formState: { errors } } = methods

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'questions',
    })

    useEffect(() => {
        if (isCreateModalOpen && selectedFormId) {
            const fetchForm = async () => {
                setIsFetching(true)
                try {
                    if (selectedFormId) {
                        const existingData = await getFormById(selectedFormId)
                        reset({
                            title: existingData.title,
                            description: existingData.description || '',
                            lockMode: (existingData as any).lockMode || false,
                            questions: existingData.questions.map((q: any) => ({
                                type: q.type as any,
                                text: q.text,
                                points: q.points,
                                imageUrl: q.imageUrl || undefined,
                                options: (q.options as any[])?.map((opt: any) => ({
                                    text: opt.text,
                                    imageUrl: opt.imageUrl || undefined,
                                    points: opt.points || 0
                                })) || [],
                                required: q.required,
                                validation: q.validation || undefined,
                                page: q.page,
                                id: q.id,
                            })),
                        })
                    }
                } catch (error) {
                    toast({ title: 'Error loading form', variant: 'destructive' })
                    setIsCreateModalOpen(false)
                } finally {
                    setIsFetching(false)
                }
            }
            fetchForm()
        } else if (isCreateModalOpen && !selectedFormId) {
            reset({
                title: '',
                description: '',
                lockMode: false,
                questions: [{ type: 'text', text: '', points: 0, options: [{ text: 'Option 1' }], originalAnswer: '', required: true, page: 1 }],
            })
        }
    }, [isCreateModalOpen, selectedFormId, reset, setIsCreateModalOpen, toast])

    const handleClose = () => {
        setIsCreateModalOpen(false)
        setSelectedFormId(null)
        reset()
    }

    const handleImageBtnClick = useCallback((index: number) => {
        setActiveOptionIndex(null)
        setActiveQuestionIndex(index)
        fileInputRef.current?.click()
    }, [])

    const handleOptionImageBtnClick = useCallback((qIdx: number, optIdx: number) => {
        setActiveQuestionIndex(null)
        setActiveOptionIndex({ qIdx, optIdx })
        fileInputRef.current?.click()
    }, [])

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            if (selectedFormId) {
                await updateForm(selectedFormId, data)
                toast({ title: 'Form updated successfully' })
            } else {
                await createForm(data)
                toast({ title: 'Form created successfully' })
            }
            handleClose()
        } catch (error) {
            toast({ title: error instanceof Error ? error.message : 'Error saving form', variant: 'destructive' })
        } finally {
            setIsLoading(false)
        }
    }

    if (!isCreateModalOpen) return null

    return (
        <FormProvider {...methods}>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 sm:p-4 overflow-y-auto">
                <div className="bg-background rounded-xl shadow-2xl w-full max-w-2xl my-auto border border-border">
                    <div className="flex justify-between items-center p-6 border-b border-border">
                        <div>
                            <h2 className="text-2xl font-bold text-foreground">{selectedFormId ? 'Edit Form' : 'Create New Form'}</h2>
                            <p className="text-sm text-muted-foreground">{selectedFormId ? 'Update your form settings and questions.' : 'Design your form and add questions below.'}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-6 max-h-[85vh] sm:max-h-[70vh] overflow-y-auto">
                        <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-foreground">Form Title</label>
                                <Input
                                    {...register('title')}
                                    placeholder="e.g. Customer Feedback"
                                    className={errors.title ? 'border-destructive' : 'bg-muted/50 border-input'}
                                />
                                {errors.title && (
                                    <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>
                                )}
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-foreground">Description (Optional)</label>
                                <textarea
                                    {...register('description')}
                                    rows={2}
                                    placeholder="Describe the purpose of this form..."
                                    className="w-full rounded-md border border-input bg-muted/50 px-3 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary transition-all text-foreground"
                                />
                            </div>

                            <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg border border-border mt-2">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm font-semibold text-foreground">Lock Mode</label>
                                        {methods.watch('lockMode') ? (
                                            <span className="text-[10px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded uppercase tracking-wider">Active</span>
                                        ) : (
                                            <span className="text-[10px] font-bold bg-muted text-muted-foreground px-1.5 py-0.5 rounded uppercase tracking-wider">Off</span>
                                        )}
                                    </div>
                                    <p className="text-xs text-muted-foreground">Detect and record when users change tabs during form filling.</p>
                                </div>
                                <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full overflow-hidden transition-colors">
                                    <input
                                        type="checkbox"
                                        {...register('lockMode')}
                                        className="peer sr-only"
                                    />
                                    <div className="absolute inset-0 bg-muted-foreground/20 transition-colors peer-checked:bg-primary" />
                                    <span className="relative ml-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform peer-checked:translate-x-5" />
                                </label>
                            </div>
                        </div>

                        <div className="border-t border-border pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-foreground">Questions</h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ type: 'text', text: '', points: 0, options: [{ text: 'Option 1' }], originalAnswer: '', required: true, page: 1 })}
                                    className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/10"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add Question
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <QuestionCard
                                        key={field.id}
                                        index={index}
                                        onRemove={remove}
                                        onImageBtnClick={handleImageBtnClick}
                                        onOptionImageBtnClick={handleOptionImageBtnClick}
                                        canRemove={fields.length > 1}
                                    />
                                ))}

                                <div className="flex justify-center pt-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => append({ type: 'text', text: '', points: 0, options: [{ text: 'Option 1' }], originalAnswer: '', required: true, page: 1 })}
                                        className="flex items-center gap-2 border-primary/20 text-primary hover:bg-primary/10 w-full py-6 border-dashed bg-muted/20"
                                    >
                                        <Plus className="w-5 h-5" />
                                        <span className="font-semibold text-base">Add Question</span>
                                    </Button>
                                </div>

                                {errors.questions && (
                                    <p className="text-red-500 text-sm mt-1">{errors.questions.message}</p>
                                )}
                            </div>
                        </div>
                    </form>

                    <div className="flex justify-end gap-3 p-6 border-t border-border bg-muted/30 rounded-b-xl">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={handleClose}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSubmit(onSubmit)}
                            disabled={isLoading || isFetching}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 transition-colors"
                        >
                            {isFetching ? 'Loading...' : isLoading ? 'Saving...' : selectedFormId ? 'Save Changes' : 'Create Form'}
                        </Button>
                    </div>
                </div>

                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (!file) return

                        const reader = new FileReader()
                        reader.onloadend = () => {
                            const base64 = reader.result as string
                            if (activeOptionIndex !== null) {
                                setValue(`questions.${activeOptionIndex.qIdx}.options.${activeOptionIndex.optIdx}.imageUrl`, base64)
                                setActiveOptionIndex(null)
                            } else if (activeQuestionIndex !== null) {
                                setValue(`questions.${activeQuestionIndex}.imageUrl`, base64)
                                setActiveQuestionIndex(null)
                            }
                        }
                        reader.readAsDataURL(file)
                        e.target.value = ''
                    }}
                />
            </div>
        </FormProvider>
    )
}
