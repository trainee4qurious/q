"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useFormStore } from "@/store/formStore"

export function useFormGuard(step: number) {
    const router = useRouter()
    const pathname = usePathname()
    const { formData, _hasHydrated, questions, isSubmitted } = useFormStore()

    const [isReady, setIsReady] = useState(false)

    useEffect(() => {
        // Skip guard check until store has hydrated from localStorage
        if (!_hasHydrated) return

        const checkGuard = () => {
            if (questions.length === 0 && step > 1) {
                return
            }

            // If form is already submitted, allow the result page
            if (isSubmitted && step > 0) {
                if (pathname.includes('/step/')) {
                    router.replace("./")
                    return
                }
                setIsReady(true)
                return
            }

            if (step === 1) {
                setIsReady(true)
                return
            }

            let isMissingData = false

            // Check all steps before current step
            for (let i = 1; i < step; i++) {
                const stepReqQuestions = questions.filter(q => Number(q.step) === i && q.required && (String(q.active).toLowerCase() === 'true' || q.active === true))
                const hasAnswers = stepReqQuestions.every(q => {
                    const ans = formData[q.id]
                    if (q.questiontype === 'checkbox' || q.questiontype === 'multi') return Array.isArray(ans) && ans.length > 0
                    return ans !== undefined && ans !== null && ans !== ''
                })

                if (!hasAnswers) {
                    isMissingData = true
                    break
                }
            }

            if (isMissingData && pathname !== "/") {
                // Adjust redirect logic if needed
                // router.replace("/")
            } else {
                setIsReady(true)
            }
        }

        checkGuard()
    }, [step, formData, router, pathname, _hasHydrated, questions, isSubmitted])

    return isReady
}
