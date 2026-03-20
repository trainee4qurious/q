"use client"

import { motion } from "framer-motion"
import { useFormStore } from "@/store/formStore"

export function ProgressBar() {
    const questions = useFormStore((state) => state.questions)
    const currentStep = useFormStore((state) => state.currentStep)

    if (questions.length === 0) return null

    const totalSteps = Math.max(...questions.map(q => Number(q.step)), 0)
    const progress = (currentStep / totalSteps) * 100

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-medium text-slate-500">
                    Step {currentStep} of {totalSteps}
                </span>
                <span className="text-sm font-bold text-blue-600">
                    {Math.round(progress)}%
                </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <motion.div
                    className="h-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                />
            </div>
        </div>
    )
}
