"use client"

import { useFormContext } from "react-hook-form"
import { motion } from "framer-motion"
import { useEffect, useMemo } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

import { Option } from "@/types/form-submission"

interface CheckboxGroupProps {
    name: string
    label: string
    description?: string
    options: Option[]
}

export function CheckboxGroup({ name, label, description, options }: CheckboxGroupProps) {
    const { setValue, watch, register, formState: { errors } } = useFormContext()
    const watchedValue = watch(name)
    const selectedValues = useMemo(() => Array.isArray(watchedValue) ? watchedValue : [], [watchedValue])
    const error = errors[name]

    // Explicitly register the field since it's a controlled component
    useEffect(() => {
        register(name)
    }, [register, name])

    const toggleOption = (optionValue: string) => {
        const isSelected = selectedValues.includes(optionValue)
        const newValues = isSelected
            ? selectedValues.filter((v: string) => v !== optionValue)
            : [...selectedValues, optionValue]

        setValue(name, newValues, {
            shouldValidate: true,
            shouldDirty: true,
            shouldTouch: true
        })
    }

    return (
        <div className="space-y-4 w-full" role="group" aria-labelledby={`${name}-label`}>
            <label id={`${name}-label`} className="text-sm font-semibold text-slate-700 block ml-1">
                {label}
            </label>
            {description && (
                <p className="text-xs text-slate-500 ml-1 -mt-1 mb-2">
                    {description}
                </p>
            )}
            <div className="grid grid-cols-1 gap-3">
                {options.map((opt, idx) => {
                    const val = opt.value || opt.label
                    const isSelected = selectedValues.includes(val)
                    return (
                        <button
                            key={`${val}-${idx}`}
                            type="button"
                            onClick={() => toggleOption(val)}
                            role="checkbox"
                            aria-checked={isSelected}
                            className={cn(
                                "flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
                                isSelected
                                    ? "border-blue-500 bg-blue-50/50 shadow-[0_0_15px_rgba(37,99,235,0.05)]"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                            )}
                        >
                            <span className={cn(
                                "font-medium",
                                isSelected ? "text-blue-700" : "text-slate-600"
                            )}>
                                {opt.label}
                            </span>
                            <div className={cn(
                                "w-6 h-6 rounded-md border flex items-center justify-center transition-colors",
                                isSelected ? "bg-blue-600 border-blue-600" : "bg-white border-slate-200"
                            )}>
                                {isSelected && <Check className="w-4 h-4 text-white" />}
                            </div>
                        </button>
                    )
                })}
            </div>

            {error && (
                <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    role="alert"
                    className="text-xs font-medium text-red-500 mt-2 ml-1"
                >
                    {error.message as string}
                </motion.p>
            )}
        </div>
    )
}
