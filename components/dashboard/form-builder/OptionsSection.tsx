'use client'

import React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Plus, Trash2, Image as ImageIcon, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface OptionsSectionProps {
    qIndex: number
    onImageBtnClick: (qIdx: number, optIdx: number) => void
}

export const OptionsSection = React.memo(({ qIndex, onImageBtnClick }: OptionsSectionProps) => {
    const { register, setValue, control } = useFormContext()
    const options = useWatch({
        control,
        name: `questions.${qIndex}.options`
    }) || []

    const addOption = () => {
        setValue(`questions.${qIndex}.options`, [...options, { text: `Option ${options.length + 1}` }])
    }

    const removeOption = (optIndex: number) => {
        const newOptions = options.filter((_: any, i: number) => i !== optIndex)
        setValue(`questions.${qIndex}.options`, newOptions)
    }

    return (
        <div className="space-y-3 p-4 bg-background rounded-lg border border-border/50 shadow-sm">
            <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-foreground">Options</label>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    className="h-7 text-xs border-primary/20 text-primary hover:bg-primary/10"
                >
                    <Plus className="w-3 h-3 mr-1" /> Add Option
                </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {options.map((option: any, optIndex: number) => (
                    <div key={optIndex} className="space-y-2 group/opt">
                        <div className="flex items-center gap-2">
                            <Input
                                {...register(`questions.${qIndex}.options.${optIndex}.text`)}
                                placeholder={`Option ${optIndex + 1}`}
                                className="h-9 text-sm bg-muted/20 border-input"
                            />
                            <div className="flex items-center gap-1">
                                <button
                                    type="button"
                                    onClick={() => onImageBtnClick(qIndex, optIndex)}
                                    className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-md transition-colors"
                                    title="Add image to option"
                                >
                                    <ImageIcon className="w-3.5 h-3.5" />
                                </button>
                                {options.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeOption(optIndex)}
                                        className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                        {option.imageUrl && (
                            <div className="relative inline-block ml-1">
                                <img src={option.imageUrl} alt="" className="h-12 w-12 object-cover rounded border border-border/50" />
                                <button
                                    type="button"
                                    onClick={() => setValue(`questions.${qIndex}.options.${optIndex}.imageUrl`, '')}
                                    className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 hover:bg-destructive/90 transition-colors shadow-sm"
                                >
                                    <X className="w-2.5 h-2.5" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    )
})

OptionsSection.displayName = 'OptionsSection'
