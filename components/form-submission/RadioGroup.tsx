"use client"

import { useFormContext } from "react-hook-form"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { cn } from "@/lib/utils"

import { Option } from "@/types/form-submission"

interface RadioGroupProps {
    name: string
    label: string
    description?: string
    options: Option[]
}

export function RadioGroup({ name, label, description, options }: RadioGroupProps) {
    const { setValue, watch, register, formState: { errors } } = useFormContext()
    const selectedValue = watch(name)
    const error = errors[name]

    // Explicitly register the field
    useEffect(() => {
        register(name)
    }, [register, name])

    return (
        <div className="space-y-4 w-full" role="radiogroup" aria-labelledby={`${name}-label`}>
            <label id={`${name}-label`} className="text-sm font-semibold text-slate-700 block ml-1">
                {label}
            </label>
            {description && (
                <p className="text-xs text-slate-500 ml-1 -mt-1 mb-2">
                    {description}
                </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map((opt, idx) => {
                    const val = opt.value || opt.label
                    const isSelected = selectedValue === val
                    const image = opt.image

                    return (
                        <button
                            key={`${val}-${idx}`}
                            type="button"
                            onClick={() => setValue(name, val, { shouldValidate: true })}
                            role="radio"
                            aria-checked={isSelected}
                            className={cn(
                                "relative flex flex-col items-center justify-center p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 outline-none focus-visible:ring-4 focus-visible:ring-blue-500/20",
                                isSelected
                                    ? "border-blue-500 bg-blue-50/30 ring-4 ring-blue-500/5"
                                    : "border-slate-100 bg-white hover:border-slate-200"
                            )}
                        >
                            {image && (
                                <div className="w-full aspect-square max-h-40 sm:max-h-none mb-4 rounded-xl overflow-hidden bg-slate-50 border border-slate-100 p-2">
                                    <img
                                        src={image}
                                        alt={opt.label}
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            )}

                            <div className={cn(
                                "w-5 h-5 rounded-full border-2 mb-3 flex items-center justify-center transition-colors",
                                isSelected ? "border-blue-600" : "border-slate-300"
                            )}>
                                {isSelected && (
                                    <motion.div
                                        layoutId={`radio-dot-${name}`}
                                        className="w-2.5 h-2.5 rounded-full bg-blue-600"
                                    />
                                )}
                            </div>
                            <span className={cn(
                                "font-bold uppercase tracking-wider text-[10px] sm:text-xs text-center",
                                isSelected ? "text-blue-700" : "text-slate-500"
                            )}>
                                {opt.label}
                            </span>
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
