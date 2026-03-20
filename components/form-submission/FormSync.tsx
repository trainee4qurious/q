"use client"

import { useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { useFormStore } from "@/store/formStore"
import { getPublicForm } from "@/app/actions/form-actions"

export function FormSync() {
    const { id } = useParams()
    const { _hasHydrated, setQuestions, setLockMode, isLoadingQuestions, setIsLoadingQuestions } = useFormStore()

    const syncForm = useCallback(async () => {
        if (isLoadingQuestions || !id) return
        setIsLoadingQuestions(true)
        try {
            const formData = await getPublicForm(id as string)
            if (formData && formData.questions.length > 0) {
                setQuestions(formData.questions)
                setLockMode(!!formData.lockMode)
            }
        } catch (err) {
            console.error('Form synchronization failed', err)
        } finally {
            setIsLoadingQuestions(false)
        }
    }, [id, isLoadingQuestions, setIsLoadingQuestions, setQuestions, setLockMode])

    useEffect(() => {
        if (_hasHydrated && id) {
            syncForm()
            // Periodic sync every 5 minutes
            const interval = setInterval(syncForm, 5 * 60 * 1000)
            return () => clearInterval(interval)
        }
    }, [_hasHydrated, id, syncForm])

    return null
}
