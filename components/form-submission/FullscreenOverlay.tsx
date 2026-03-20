'use client'

import { useEffect, useState, useCallback } from 'react'
import { useFormStore } from '@/store/formStore'
import { Maximize, ShieldAlert } from 'lucide-react'

export function FullscreenOverlay() {
  const { lockMode, isSubmitted, _hasHydrated } = useFormStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  const checkFullscreen = useCallback(() => {
    const fullscreenElement = 
      document.fullscreenElement || 
      (document as any).webkitFullscreenElement || 
      (document as any).mozFullScreenElement || 
      (document as any).msFullscreenElement
    setIsFullscreen(!!fullscreenElement)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Check if fullscreen is supported
    const doc = document.documentElement
    const requestMethod = 
      doc.requestFullscreen || 
      (doc as any).webkitRequestFullScreen || 
      (doc as any).mozRequestFullScreen || 
      (doc as any).msRequestFullscreen
    
    setIsSupported(!!requestMethod)
    checkFullscreen()

    const handleFullscreenChange = () => {
      checkFullscreen()
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [checkFullscreen])

  const enterFullscreen = async () => {
    try {
      const doc = document.documentElement
      if (doc.requestFullscreen) {
        await doc.requestFullscreen()
      } else if ((doc as any).webkitRequestFullScreen) {
        await (doc as any).webkitRequestFullScreen()
      } else if ((doc as any).mozRequestFullScreen) {
        await (doc as any).mozRequestFullScreen()
      } else if ((doc as any).msRequestFullscreen) {
        await (doc as any).msRequestFullscreen()
      }
    } catch (error) {
      console.error('Failed to enter fullscreen:', error)
    }
  }

  // Only show overlay if lockMode is active, not submitted, hydrated, and NOT in fullscreen
  if (!_hasHydrated || !lockMode || isSubmitted || isFullscreen) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-slate-900 text-white p-6 text-center backdrop-blur-md">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-10 rounded-2xl shadow-2xl border border-slate-700 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="p-4 bg-blue-500/10 rounded-full border border-blue-500/20">
            <ShieldAlert className="w-12 h-12 text-blue-400" />
          </div>
        </div>
        
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tight">Lock Mode Enabled</h2>
          <p className="text-slate-400 text-lg leading-relaxed">
            This form is protected by Lock Mode. To ensure a secure and focused experience, you must complete it in full screen.
          </p>
        </div>

        {!isSupported ? (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
            Your browser does not support full screen mode. Please use a modern desktop browser.
          </div>
        ) : (
          <button
            onClick={enterFullscreen}
            className="group relative w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/25"
          >
            <Maximize className="w-5 h-5 transition-transform group-hover:scale-110" />
            Enter Full Screen
          </button>
        )}
        
        <p className="text-slate-500 text-sm italic">
          Exiting full screen will pause your progress.
        </p>
      </div>
    </div>
  )
}
