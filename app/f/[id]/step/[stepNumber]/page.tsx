"use client"

import { useEffect, useState, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useFormStore } from "@/store/formStore"
import { StepLayout } from "@/components/form-submission/StepLayout"
import { NavigationButtons } from "@/components/form-submission/NavigationButtons"
import { useFormGuard } from "@/hooks/useFormGuard"
import { generateStepSchema, getDefaultValues } from "@/lib/validations/form-submission"
import { DynamicQuestion } from "@/components/form-submission/DynamicQuestion"
import { submitFormResponse } from "@/app/actions/form-actions"
import { useToast } from "@/hooks/use-toast"
import { ShieldAlert } from "lucide-react"

export default function DynamicStepPage() {
    const params = useParams()
    const id = params.id as string
    const stepNumber = Number(params.stepNumber)
    const isReady = useFormGuard(stepNumber)
    const router = useRouter()

    const {
        formData,
        setFormData,
        setCurrentStep,
        questions,
        submissionId,
        setSubmissionId,
        formSessionId,
        setSubmissionStatus,
        setTotalScore,
        lockMode,
        tabSwitches,
        incrementTabSwitches
    } = useFormStore()
    const { toast } = useToast()

    const [isSubmitting, setIsSubmitting] = useState(false)

    // Calculate total steps
    const maxStep = useMemo(() => {
        return Math.max(...questions.map(q => Number(q.step)), 0)
    }, [questions])

    const isLastStep = stepNumber === maxStep

    const stepQuestions = useMemo(() =>
        questions.filter(q =>
            Number(q.step) === stepNumber &&
            (String(q.active).toLowerCase() === 'true' || q.active === true)
        ).sort((a, b) => (Number(a.order) || 0) - (Number(b.order) || 0)),
        [questions, stepNumber]
    )

    const schema = useMemo(() => generateStepSchema(stepQuestions), [stepQuestions])
    const defaultValues = useMemo(() => getDefaultValues(stepQuestions, formData), [stepQuestions, formData])

    const methods = useForm({
        resolver: zodResolver(schema),
        defaultValues
    })

    useEffect(() => {
        methods.reset(defaultValues)
    }, [stepNumber, methods]) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (isReady) {
            setCurrentStep(stepNumber)
        }
    }, [isReady, stepNumber, setCurrentStep])

    // Lock Mode Logic
    useEffect(() => {
        if (!lockMode || !isReady) return

        // Initial warning for step 1
        if (stepNumber === 1) {
            toast({
                title: "Lock Mode Active",
                description: "Don't change tabs! Leaving this page is blocked and will be recorded.",
                variant: "destructive",
                duration: 5000,
            })
        }

        const handleVisibilityChange = () => {
            if (document.hidden) {
                // User left the tab
            } else {
                // User came back
                incrementTabSwitches()
                toast({
                    title: "Tab Switch Detected",
                    description: "Your tab switch has been recorded.",
                    variant: "destructive",
                })
            }
        }

        const handleFocus = () => {
            // User came back to the window
        }

        const handleBlur = () => {
            // Optional: notify when they leave, but toast won't be seen until they return anyway
        }

        document.addEventListener("visibilitychange", handleVisibilityChange)
        window.addEventListener("focus", handleFocus)
        window.addEventListener("blur", handleBlur)

        return () => {
            document.removeEventListener("visibilitychange", handleVisibilityChange)
            window.removeEventListener("focus", handleFocus)
            window.removeEventListener("blur", handleBlur)
        }
    }, [lockMode, isReady, stepNumber, toast, incrementTabSwitches])

    const calculateScore = (data: any, allQuestions: any[]) => {
        let total = 0
        allQuestions.forEach(q => {
            const answer = data[q.id]
            if (answer === undefined || answer === null || answer === '') return

            const correctAns = q.originalAnswer
            const points = Number(q.points) || 0

            if (q.questiontype === 'checkbox' || q.questiontype === 'multi') {
                const selectedValues = (Array.isArray(answer) ? answer : [answer]).filter(Boolean).sort()
                const correctValues = (correctAns ? String(correctAns).split(',').filter(Boolean) : []).sort()

                // If options have their own points, use those (legacy support or potential future use)
                const selectedOptionsWithPoints = q.options?.filter((opt: any) =>
                    selectedValues.includes(opt.value || opt.label) && opt.points > 0
                )

                if (selectedOptionsWithPoints && selectedOptionsWithPoints.length > 0) {
                    selectedOptionsWithPoints.forEach((opt: any) => total += Number(opt.points))
                } else if (points > 0 && JSON.stringify(selectedValues) === JSON.stringify(correctValues)) {
                    total += points
                }
            } else if (q.questiontype === 'radio' || q.questiontype === 'dropdown' || q.questiontype === 'select' || q.questiontype === 'choice') {
                const selectedValue = String(answer)

                // Check for option-level points first
                const selectedOption = q.options?.find((opt: any) => (opt.value || opt.label) === selectedValue)

                if (selectedOption?.points && Number(selectedOption.points) > 0) {
                    total += Number(selectedOption.points)
                } else if (points > 0 && correctAns && selectedValue === String(correctAns)) {
                    total += points
                }
            } else {
                // For text, email, number, etc.
                if (points > 0 && correctAns && String(answer).trim().toLowerCase() === String(correctAns).trim().toLowerCase()) {
                    total += points
                }
            }
        })
        return total
    }

    const onSubmit = async (data: any) => {
        setFormData(data)
        const updatedFormData = { ...formData, ...data }

        if (isLastStep) {
            setIsSubmitting(true)
            const totalScore = calculateScore(updatedFormData, questions)
            setTotalScore(totalScore)

            setSubmissionStatus('submitting')
            try {
                const result = await submitFormResponse(id, updatedFormData, totalScore, tabSwitches)

                if (result.success) {
                    setSubmissionStatus('success')
                    router.replace(`/f/${id}/result/success`)
                } else {
                    setSubmissionStatus('error', result.error)
                    router.replace(`/f/${id}/result/failure`)
                }
            } catch (error) {
                // console.error("Submission failed", error) // Removed console.error
                setSubmissionStatus('error', 'Network error')
                router.replace(`/f/${id}/result/failure`)
            }
        } else {
            router.push(`/f/${id}/step/${stepNumber + 1}`)
        }
    }

    if (!isReady || (questions.length > 0 && stepQuestions.length === 0)) {
        return (
            <StepLayout title="Loading..." description="Preparing your questions...">
                <div className="flex justify-center p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            </StepLayout>
        )
    }

    if (isSubmitting) {
        return (
            <StepLayout title="Submitting..." description="Securely recording your responses. Please wait.">
                <div className="flex flex-col items-center justify-center p-12 space-y-6">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-10 h-10 bg-blue-50 rounded-full animate-ping"></div>
                        </div>
                    </div>
                    <p className="text-slate-400 font-bold tracking-widest uppercase text-xs animate-pulse">Syncing Data...</p>
                </div>
            </StepLayout>
        )
    }

    const title = stepQuestions.length === 1 ? stepQuestions[0].question : `Step ${stepNumber}`
    const description = stepQuestions.length === 1 ? stepQuestions[0].description : "Please answer the questions below."

    return (
        <StepLayout title={title} description={description}>
            {lockMode && stepNumber === 1 && (
                <div className="mb-6 p-4 rounded-lg bg-red-50 border-2 border-red-200 flex items-start gap-3 animate-pulse">
                    <ShieldAlert className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                        <h4 className="font-bold text-red-800">Lock Mode Enabled</h4>
                        <p className="text-sm text-red-700">
                            Please do not switch tabs or windows. All switches are being recorded.
                        </p>
                    </div>
                </div>
            )}
            <FormProvider {...methods} key={`${formSessionId}-${stepNumber}`}>
                <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
                    {stepQuestions.map(q => (
                        <DynamicQuestion
                            key={q.id}
                            question={q}
                            hideLabel={stepQuestions.length === 1}
                            hideDescription={stepQuestions.length === 1}
                        />
                    ))}

                    <NavigationButtons
                        prevHref={stepNumber > 1 ? `/f/${id}/step/${stepNumber - 1}` : `/f/${id}`}
                        nextLabel={isLastStep ? "Submit" : "Next"}
                        isSubmitting={isSubmitting}
                    />
                </form>
            </FormProvider>
        </StepLayout>
    )
}
