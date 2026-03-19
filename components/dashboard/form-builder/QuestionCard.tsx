'use client'

import React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Trash2, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { OptionsSection } from './OptionsSection'
import { OriginalAnswerSection } from './OriginalAnswerSection'

interface QuestionCardProps {
    index: number
    onRemove: (index: number) => void
    onImageBtnClick: (qIndex: number) => void
    onOptionImageBtnClick: (qIdx: number, optIdx: number) => void
    canRemove: boolean
}

export const QuestionCard = React.memo(({
    index,
    onRemove,
    onImageBtnClick,
    onOptionImageBtnClick,
    canRemove
}: QuestionCardProps) => {
    const { register, setValue, control } = useFormContext()
    const questionType = useWatch({
        control,
        name: `questions.${index}.type`
    })
    const points = useWatch({
        control,
        name: `questions.${index}.points`
    })
    const imageUrl = useWatch({
        control,
        name: `questions.${index}.imageUrl`
    })

    return (
        <div className="p-4 bg-muted/30 rounded-lg border border-border space-y-4 relative group">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 space-y-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Question {index + 1}</label>
                            <Input
                                {...register(`questions.${index}.text`)}
                                placeholder="Enter your question here..."
                                className="bg-background border-input"
                            />
                        </div>
                        <div className="w-full sm:w-32 space-y-1">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Type</label>
                            <Select {...register(`questions.${index}.type`)} className="bg-background border-input text-foreground">
                                <option value="text">Text</option>
                                <option value="email">Email</option>
                                <option value="number">Number</option>
                                <option value="phone">Phone</option>
                                <option value="radio">Radio Button</option>
                                <option value="checkbox">Checkbox</option>
                                <option value="textarea">Text Area</option>
                                <option value="dropdown">Dropdown</option>
                                <option value="file">File Upload</option>
                            </Select>
                        </div>
                        <div className="flex flex-row sm:flex-col justify-end pb-1 gap-2">
                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    {...register(`questions.${index}.required`)}
                                    className="w-4 h-4 rounded border-input text-primary focus:ring-primary bg-background"
                                />
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Required</span>
                            </label>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Points:</label>
                            <Input
                                type="number"
                                {...register(`questions.${index}.points`, { valueAsNumber: true })}
                                className="w-20 bg-background border-input"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Validation:</label>
                            <Select {...register(`questions.${index}.validation`)} className="bg-background border-input text-foreground py-1 h-9">
                                <option value="">None</option>
                                <option value="email">Email Format</option>
                                <option value="phone">Phone Number</option>
                                <option value="name">Name Only</option>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-muted-foreground">Page:</label>
                            <Input
                                type="number"
                                {...register(`questions.${index}.page`, { valueAsNumber: true })}
                                className="w-20 bg-background border-input"
                                min={1}
                            />
                        </div>

                        <div className="relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onImageBtnClick(index)}
                                className="flex items-center gap-1 text-muted-foreground hover:text-primary p-1"
                            >
                                <ImageIcon className="w-4 h-4" />
                                {imageUrl ? 'Update Image' : 'Add Image'}
                            </Button>
                        </div>
                    </div>

                    {['radio', 'checkbox', 'dropdown'].includes(questionType) && (
                        <OptionsSection qIndex={index} onImageBtnClick={onOptionImageBtnClick} />
                    )}

                    {points > 0 && (
                        <OriginalAnswerSection qIndex={index} />
                    )}

                    {imageUrl && (
                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-border/50">
                            <img
                                src={imageUrl}
                                alt="Question"
                                className="w-full h-full object-cover"
                            />
                            <button
                                type="button"
                                onClick={() => setValue(`questions.${index}.imageUrl`, '')}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 shadow-sm transition-colors"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>

                {canRemove && (
                    <button
                        type="button"
                        onClick={() => onRemove(index)}
                        className="mt-6 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                        title="Remove question"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                )}
            </div>
        </div>
    )
})

QuestionCard.displayName = 'QuestionCard'
