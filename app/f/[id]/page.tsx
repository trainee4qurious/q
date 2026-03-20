"use client"

import { useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useFormStore } from "@/store/formStore"
import { StepLayout } from "@/components/form-submission/StepLayout"
import { getPublicForm } from "@/app/actions/form-actions"

export default function RootPage() {
    const { id } = useParams()
    const { _hasHydrated, questions, isSubmitted, resetForm, isLoadingQuestions, activeFormId } = useFormStore()
    const router = useRouter()

    useEffect(() => {
        if (_hasHydrated && isSubmitted) {
            resetForm()
        }
    }, [_hasHydrated, isSubmitted, resetForm])

    // Automatic redirect once sync is complete for THIS form
    useEffect(() => {
        if (_hasHydrated && !isLoadingQuestions && id === activeFormId) {
            router.replace(`/f/${id}/step/1`)
        }
    }, [_hasHydrated, id, activeFormId, isLoadingQuestions, router])

    return (
        <StepLayout title="Loading..." description="Preparing your form...">
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        </StepLayout>
    )
}
