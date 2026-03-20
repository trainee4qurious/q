"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { useFormStore } from "@/store/formStore"
import { StepLayout } from "@/components/form-submission/StepLayout"

export default function RootPage() {
    const { id } = useParams()
    const { _hasHydrated, questions, isSubmitted, resetForm } = useFormStore()
    const router = useRouter()

    useEffect(() => {
        if (_hasHydrated && isSubmitted) {
            resetForm()
        }
    }, [_hasHydrated, isSubmitted, resetForm])

    useEffect(() => {
        if (_hasHydrated && questions.length > 0 && id) {
            router.replace(`/f/${id}/step/1`)
        }
    }, [_hasHydrated, questions, id, router])

    return (
        <StepLayout title="Loading..." description="Preparing your form...">
            <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        </StepLayout>
    )
}
