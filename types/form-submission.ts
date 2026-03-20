export type QuestionType = 'input' | 'textarea' | 'dropdown' | 'checkbox' | 'radio' | 'kyc' | 'text' | 'select' | 'multi' | 'choice' | 'email' | 'mail' | 'number' | 'phone' | 'file'

export interface Option {
    label: string
    value: string
    image?: string
    points?: number
}

export interface Question {
    id: string
    step: number
    question: string
    description?: string
    imageUrl?: string
    questiontype: QuestionType
    options?: Option[]
    required: boolean
    placeholder?: string
    minlength?: number
    maxlength?: number
    order: number
    active: boolean
    successimage?: string
    failureimage?: string
    points?: number
}

export type FormData = Record<string, any>

export type FormStore = {
    formData: FormData
    questions: Question[]
    lastSync: number | null
    submissionId: string | null
    currentStep: number
    _hasHydrated: boolean
    setFormData: (data: Partial<FormData>) => void
    setQuestions: (questions: Question[]) => void
    setSubmissionId: (id: string) => void
    setCurrentStep: (step: number) => void
    setHasHydrated: (status: boolean) => void
    isSubmitted: boolean
    formSessionId: string
    submissionStatus: 'idle' | 'submitting' | 'success' | 'error'
    submissionError: string | null
    totalScore: number
    isLoadingQuestions: boolean
    lockMode: boolean
    tabSwitches: number
    activeFormId: string | null
    setIsSubmitted: (isSubmitted: boolean) => void
    setSubmissionStatus: (status: 'idle' | 'submitting' | 'success' | 'error', error?: string) => void
    setTotalScore: (score: number) => void
    setIsLoadingQuestions: (isLoading: boolean) => void
    setLockMode: (lockMode: boolean) => void
    setActiveFormId: (id: string | null) => void
    incrementTabSwitches: () => void
    resetForm: () => void
}
