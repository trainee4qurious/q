"use client"

import { useFormContext } from "react-hook-form"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

import { Option } from "@/types/form-submission"

interface DropdownProps {
    name: string
    label: string
    description?: string
    options: Option[]
    placeholder?: string
}

export function Dropdown({ name, label, description, options, placeholder = "Select an option" }: DropdownProps) {
    const { register, formState: { errors } } = useFormContext()
    const [isMounted, setIsMounted] = useState(false)
    const error = errors[name]

    useEffect(() => {
        setIsMounted(true)
    }, [])

    return (
        <div className="space-y-2 w-full">
            <label id={`${name}-label`} className="text-sm font-semibold text-slate-700 block ml-1">
                {label}
            </label>
            {description && (
                <p className="text-xs text-slate-500 ml-1 -mt-1 mb-2">
                    {description}
                </p>
            )}
            <div className="relative">
                <select
                    {...register(name)}
                    aria-labelledby={`${name}-label`}
                    aria-invalid={!!error}
                    className={cn(
                        "w-full px-4 py-3 bg-white border rounded-xl text-slate-900 text-base transition-all duration-200 outline-none appearance-none cursor-pointer",
                        "focus:ring-4",
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10"
                    )}
                    defaultValue=""
                >
                    <option value="" disabled>
                        {placeholder}
                    </option>
                    {options.map((opt, idx) => {
                        const val = opt.value || opt.label
                        return (
                            <option key={`${val}-${idx}`} value={val}>
                                {opt.label}
                            </option>
                        )
                    })}
                </select>

                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <ChevronDown className="w-5 h-5" />
                </div>
                {isMounted && error && (
                    <motion.p
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-xs font-medium text-red-500 mt-1.5 ml-1"
                        role="alert"
                    >
                        {error.message as string}
                    </motion.p>
                )}
            </div>
        </div>
    )
}
