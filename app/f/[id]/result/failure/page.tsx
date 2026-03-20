"use client"

import { useRouter, useParams } from "next/navigation"
import { motion } from "framer-motion"
import { useEffect } from "react"
import { useFormStore } from "@/store/formStore"
import { XCircle, RotateCcw } from "lucide-react"
import { useFormGuard } from "@/hooks/useFormGuard"
import { SubmissionStatus } from "@/components/form-submission/SubmissionStatus"

export default function FailurePage() {
    const { id } = useParams()
    const isReady = useFormGuard(999)
    const router = useRouter()
    const { questions, resetForm, setIsSubmitted } = useFormStore()

    const failureImage = questions.find(q => q.failureimage)?.failureimage

    useEffect(() => {
        setIsSubmitted(true)
    }, [setIsSubmitted])

    const handleRestart = () => {
        resetForm()
        router.push(`/f/${id}`)
    }

    if (!isReady) return null

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 text-center"
            >
                {failureImage ? (
                    <div className="w-full aspect-square max-h-48 mb-6 rounded-3xl overflow-hidden bg-slate-50 border border-slate-100">
                        <img
                            src={failureImage}
                            alt="Failure"
                            className="w-full h-full object-contain p-4"
                        />
                    </div>
                ) : (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.2 }}
                        className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-6 text-red-600"
                    >
                        <XCircle className="w-8 h-8" />
                    </motion.div>
                )}

                <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Validation Failed</h1>
                <p className="text-slate-500 leading-relaxed mb-10 font-medium">
                    You failed because you scored less than the required criteria.
                </p>

                <div className="grid grid-cols-1 gap-4">
                    <button
                        onClick={handleRestart}
                        className="flex items-center justify-center gap-2 py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 shadow-xl group"
                    >
                        <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                        Start Over
                    </button>

                    <SubmissionStatus />
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-slate-400 text-sm font-bold tracking-widest uppercase"
            >
                Formify • Validation Report
            </motion.p>
        </div>
    )
}
