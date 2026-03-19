'use client'

import React from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Input } from '@/components/ui/input'

interface OriginalAnswerSectionProps {
    qIndex: number
}

export const OriginalAnswerSection = React.memo(({ qIndex }: OriginalAnswerSectionProps) => {
    const { register, setValue, control } = useFormContext()

    const type = useWatch({
        control,
        name: `questions.${qIndex}.type`
    })
    const options = useWatch({
        control,
        name: `questions.${qIndex}.options`
    }) || []
    const originalAnswer = useWatch({
        control,
        name: `questions.${qIndex}.originalAnswer`
    }) || ''

    const isSelected = (text: string) => {
        if (type === 'checkbox') {
            return originalAnswer.split(',').filter(Boolean).includes(text)
        }
        return originalAnswer === text
    }

    const handleSelection = (text: string) => {
        if (type === 'checkbox') {
            const current = originalAnswer.split(',').filter(Boolean)
            const next = current.includes(text)
                ? current.filter((v: string) => v !== text)
                : [...current, text]
            setValue(`questions.${qIndex}.originalAnswer`, next.join(','))
        } else {
            setValue(`questions.${qIndex}.originalAnswer`, text)
        }
    }

    return (
        <div className="space-y-2 bg-background p-4 rounded-lg border border-border/50 shadow-sm">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Original Answer (For Scoring)</label>

            {['radio', 'checkbox', 'dropdown'].includes(type) ? (
                <div className="space-y-2">
                    <p className="text-xs text-muted-foreground mb-2">
                        {type === 'checkbox' ? 'Select all correct options:' : 'Select the correct option:'}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {options.map((option: any, optIdx: number) => {
                            const selected = isSelected(option.text)
                            return (
                                <label key={optIdx} className={`flex flex-col gap-2 p-2 rounded-md border transition-all cursor-pointer ${selected ? 'border-primary/30 bg-primary/10' : 'border-border/50 hover:bg-muted/50'}`}>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type={type === 'checkbox' ? 'checkbox' : 'radio'}
                                            name={`correct-answer-${qIndex}`}
                                            checked={selected}
                                            onChange={() => handleSelection(option.text)}
                                            className="w-4 h-4 text-primary focus:ring-primary border-input bg-background"
                                        />
                                        <span className="text-sm text-foreground truncate font-medium">{option.text || `Option ${optIdx + 1}`}</span>
                                    </div>
                                    {option.imageUrl && (
                                        <img src={option.imageUrl} alt="" className="h-10 w-10 object-cover rounded ml-6 border border-border/50" />
                                    )}
                                </label>
                            )
                        })}
                    </div>
                </div>
            ) : (
                <Input
                    {...register(`questions.${qIndex}.originalAnswer`)}
                    placeholder="Enter the correct answer or reference answer..."
                    className="bg-muted/20 border-input text-foreground"
                />
            )}
        </div>
    )
})

OriginalAnswerSection.displayName = 'OriginalAnswerSection'
