"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { ChevronRight, ChevronLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface NavigationButtonsProps {
    prevHref?: string
    nextLabel?: string
    isSubmitting?: boolean
    onBack?: () => void
    className?: string
}

export function NavigationButtons({
    prevHref,
    nextLabel = "Next",
    isSubmitting = false,
    onBack,
    className
}: NavigationButtonsProps) {
    const router = useRouter()

    const handleBack = () => {
        if (onBack) {
            onBack()
        } else if (prevHref) {
            router.push(prevHref)
        } else {
            router.back()
        }
    }

    return (
        <div className="flex items-center justify-between gap-3 sm:gap-4 mt-10">
            {prevHref || onBack ? (
                <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 hover:border-slate-300 transition-all duration-200 active:scale-95 flex-1 sm:flex-none"
                >
                    <ChevronLeft className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">Back</span>
                </button>
            ) : (
                <div />
            )}

            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className={cn(
                    "flex items-center justify-center gap-2 px-5 sm:px-8 py-3 rounded-xl bg-blue-600 text-white font-bold shadow-[0_10px_20px_rgba(37,99,235,0.2)]",
                    "hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex-1 sm:flex-none",
                    className
                )}
            >
                {isSubmitting ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                    <>
                        {nextLabel}
                        {nextLabel === "Next" && <ChevronRight className="w-5 h-5" />}
                    </>
                )}
            </motion.button>
        </div>
    )
}
