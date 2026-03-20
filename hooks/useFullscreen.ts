import { useState, useEffect, useCallback } from 'react'

export function useFullscreen() {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  const checkFullscreen = useCallback(() => {
    if (typeof document === 'undefined') return

    const doc = document as any
    // Strictly require the API-level fullscreen element to be present
    // AND verify that the window height matches the screen height (indicating browser chrome is hidden)
    const hasFullscreenElement = !!(
      doc.fullscreenElement ||
      doc.webkitFullscreenElement ||
      doc.mozFullScreenElement ||
      doc.msFullscreenElement
    )

    // Fallback/Safety: In true API fullscreen, window.innerHeight should be very close to screen.height
    // This helps catch cases where the API might report misleading state or on some mobile browsers
    const isHeightCorrect = typeof window !== 'undefined' && window.innerHeight >= screen.height - 10

    const isFullscreenNow = hasFullscreenElement && isHeightCorrect
    
    setIsFullscreen(isFullscreenNow)
  }, [])

  const enterFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return
    const docElm = document.documentElement as any
    try {
      if (docElm.requestFullscreen) {
        await docElm.requestFullscreen()
      } else if (docElm.webkitRequestFullscreen) {
        await docElm.webkitRequestFullscreen()
      } else if (docElm.mozRequestFullScreen) {
        await docElm.mozRequestFullScreen()
      } else if (docElm.msRequestFullscreen) {
        await docElm.msRequestFullscreen()
      } else {
        console.warn('Fullscreen API is not supported on this browser/device.')
      }
    } catch (err) {
      console.error('Error attempting to enter full-screen mode:', err)
    }
  }, [])

  const exitFullscreen = useCallback(async () => {
    if (typeof document === 'undefined') return
    const doc = document as any
    try {
      if (doc.exitFullscreen) {
        await doc.exitFullscreen()
      } else if (doc.webkitExitFullscreen) {
        await doc.webkitExitFullscreen()
      } else if (doc.mozCancelFullScreen) {
        await doc.mozCancelFullScreen()
      } else if (doc.msExitFullscreen) {
        await doc.msExitFullscreen()
      }
    } catch (err) {
      console.error('Error attempting to exit full-screen mode:', err)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return

    const docElm = document.documentElement as any
    const supported = !!(
      docElm.requestFullscreen ||
      docElm.webkitRequestFullscreen ||
      docElm.mozRequestFullScreen ||
      docElm.msRequestFullscreen
    )
    setIsSupported(supported)

    // Initial check
    checkFullscreen()

    const handleFullscreenChange = () => {
      checkFullscreen()
    }

    // Event listeners for state changes
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)
    document.addEventListener('visibilitychange', handleFullscreenChange)
    window.addEventListener('focus', handleFullscreenChange)
    window.addEventListener('resize', handleFullscreenChange)

    // Visual Viewport listeners for mobile robustness
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleFullscreenChange)
      window.visualViewport.addEventListener('scroll', handleFullscreenChange)
    }

    // High-frequency periodic check as a safety measure (100ms)
    // This is essential to catch cases where events might be throttled or not fired by the OS
    const interval = setInterval(checkFullscreen, 100)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
      document.removeEventListener('visibilitychange', handleFullscreenChange)
      window.removeEventListener('focus', handleFullscreenChange)
      window.removeEventListener('resize', handleFullscreenChange)
      
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleFullscreenChange)
        window.visualViewport.removeEventListener('scroll', handleFullscreenChange)
      }

      clearInterval(interval)
    }
  }, [checkFullscreen])

  return {
    isFullscreen,
    isSupported,
    enterFullscreen,
    exitFullscreen,
    checkFullscreen
  }
}
