import { useFormContext } from "react-hook-form"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    name: string
    label: string
    description?: string
    capitalize?: boolean
}

export function FormInput({ name, label, description, capitalize, className, onChange, ...props }: FormInputProps) {
    const { register, setValue, formState: { errors } } = useFormContext()
    const [isMounted, setIsMounted] = useState(false)
    const error = errors[name]

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const { onChange: rOnChange, ...registration } = register(name)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (capitalize) {
            const value = e.target.value
            const capitalizedValue = value.charAt(0).toUpperCase() + value.slice(1)
            setValue(name, capitalizedValue, { shouldValidate: true })
        }
        rOnChange(e)
        if (onChange) onChange(e)
    }

    return (
        <div className="space-y-2 w-full">
            <label
                htmlFor={name}
                className="text-sm font-semibold text-slate-700 block ml-1"
            >
                {label}
            </label>
            {description && (
                <p className="text-xs text-slate-500 ml-1 -mt-1 mb-2">
                    {description}
                </p>
            )}
            <div className="relative">
                <input
                    id={name}
                    {...registration}
                    onChange={handleChange}
                    className={cn(
                        "w-full px-4 py-3 bg-white border rounded-xl text-slate-900 text-base transition-all duration-200 outline-none",
                        "placeholder:text-slate-400 focus:ring-4",
                        error
                            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
                            : "border-slate-200 focus:border-blue-500 focus:ring-blue-500/10",
                        className
                    )}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${name}-error` : undefined}
                    {...props}
                />
                {isMounted && error && (
                    <motion.p
                        id={`${name}-error`}
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
