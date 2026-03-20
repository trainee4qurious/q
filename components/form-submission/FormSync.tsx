"use client"

import { useEffect, useCallback, useRef } from "react"
import { useParams } from "next/navigation"
import { useFormStore } from "@/store/formStore"
import { getPublicForm } from "@/app/actions/form-actions"

export function FormSync() {
    const { id } = useParams()
    const { 
        _hasHydrated, 
        activeFormId, 
        setActiveFormId,
        setQuestions, 
        setLockMode, 
        isLoadingQuestions, 
        setIsLoadingQuestions 
    } = useFormStore()

    const syncForm = useCallback(async (targetId: string) => {
        if (!targetId) return
        
        // Use getState to avoid dependency on isLoadingQuestions
        const currentState = useFormStore.getState()
        if (currentState.isLoadingQuestions) return

        setIsLoadingQuestions(true)
        try {
            const formData = await getPublicForm(targetId)
            if (formData) {
                setQuestions(formData.questions || [])
                setLockMode(!!formData.lockMode)
            }
            // Always set activeFormId after an attempt to prevent infinite reset loops
            setActiveFormId(targetId)
        } catch (err) {
            console.error('Form synchronization failed', err)
            // Even on error, we mark the ID as "attempted" so we don't keep looping
            setActiveFormId(targetId)
        } finally {
            setIsLoadingQuestions(false)
        }
    }, [setIsLoadingQuestions, setQuestions, setLockMode, setActiveFormId])

    useEffect(() => {
        if (_hasHydrated && id && id !== activeFormId && !isLoadingQuestions) {
            // Reset form-specific state ONLY when switching to a DIFFERENT form
            setLockMode(false)
            setQuestions([])
            syncForm(id as string)
        }
    }, [_hasHydrated, id, activeFormId, isLoadingQuestions, syncForm, setLockMode, setQuestions])

    // Safety: Reset loading state if it sticks for too long
    useEffect(() => {
        if (isLoadingQuestions) {
            const timer = setTimeout(() => {
                setIsLoadingQuestions(false)
            }, 10000) // 10 second timeout
            return () => clearTimeout(timer)
        }
    }, [isLoadingQuestions, setIsLoadingQuestions])

    useEffect(() => {
        if (_hasHydrated && id) {
            // Periodic sync every 5 minutes
            const interval = setInterval(() => {
                if (!isLoadingQuestions) syncForm(id as string)
            }, 5 * 60 * 1000)
            return () => clearInterval(interval)
        }
    }, [_hasHydrated, id, syncForm, isLoadingQuestions])

    return null
}
