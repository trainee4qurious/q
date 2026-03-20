"use client"

import { motion, AnimatePresence } from "framer-motion"
import { ProgressBar } from "./ProgressBar"
import { useFormStore } from "@/store/formStore"
import { useFullscreen } from "@/hooks/useFullscreen"
import { Maximize2, ShieldAlert } from "lucide-react"
import { Button } from "../ui/button"

interface StepLayoutProps {
    children: React.ReactNode
    title: string
    description?: string
}

export function StepLayout({ children, title, description }: StepLayoutProps) {
    const { lockMode, _hasHydrated } = useFormStore()
    const { isFullscreen, isSupported, enterFullscreen } = useFullscreen()

    const showFullscreenEnforcement = _hasHydrated && lockMode && !isFullscreen && isSupported

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center p-4 pt-8 sm:pt-12 selection:bg-blue-100 relative overflow-hidden">
            <ProgressBar />

            {/* Main Content */}
            <motion.div
                key="step-content"
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="w-full max-w-lg bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-slate-200/60 z-10"
            >
                <div className="p-6 sm:p-10">
                    {_hasHydrated && lockMode && !isSupported && (
                        <div className="mb-6 p-4 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-3">
                            <ShieldAlert className="h-5 w-5 text-amber-600 mt-0.5" />
                            <div className="text-sm text-amber-800">
                                <p className="font-bold">Device Limitation</p>
                                <p>Lock Mode is active, but your browser doesn't support forced fullscreen. Please avoid switching tabs manually.</p>
                            </div>
                        </div>
                    )}

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

            {/* Fullscreen Enforcement Overlay */}
            <AnimatePresence>
                {showFullscreenEnforcement && (
                    <motion.div
                        key="fullscreen-enforcement"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-white rounded-3xl p-8 flex flex-col items-center text-center space-y-6 shadow-2xl"
                        >
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center">
                                <ShieldAlert className="w-10 h-10 text-red-600" />
                            </div>
                            
                            <div className="space-y-2">
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Fullscreen Required</h2>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    To ensure focus and security, this form requires fullscreen mode. Please enter fullscreen to continue.
                                </p>
                            </div>

                            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100/50 w-full text-xs text-red-700 font-medium">
                                <p>All tab switches and attempts to exit fullscreen are recorded for verification.</p>
                            </div>

                            <Button 
                                onClick={enterFullscreen}
                                className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-3 transition-all duration-200 active:scale-95 text-lg"
                            >
                                <Maximize2 className="w-6 h-6" />
                                Start Fullscreen
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <p className="mt-8 text-xs text-slate-400 font-medium uppercase tracking-widest relative z-0">
                Powered by Formify
            </p>
        </div>
    )
}
