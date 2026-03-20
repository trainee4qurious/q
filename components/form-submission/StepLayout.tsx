"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ProgressBar } from "./ProgressBar"

interface StepLayoutProps {
    children: React.ReactNode
    title: string
    description?: string
}

export function StepLayout({ children, title, description }: StepLayoutProps) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pt-8 sm:pt-12 selection:bg-blue-100">
            <ProgressBar />

            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200/60"
            >
                <div className="p-6 sm:p-10">
                    <div className="mb-8">
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                            {title}
                        </h1>
                        {description && (
                            <p className="mt-2 text-slate-500 leading-relaxed">
                                {description}
                            </p>
                        )}
                    </div>

                    {children}
                </div>
            </motion.div>

            <p className="mt-8 text-xs text-slate-400 font-medium uppercase tracking-widest">
                Powered by Formify
            </p>
        </div>
    )
}
