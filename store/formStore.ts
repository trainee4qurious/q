import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { FormStore } from '@/types/form-submission'

export const useFormStore = create<FormStore>()(
    persist(
        (set) => ({
            formData: {},
            questions: [],
            submissionId: null,
            currentStep: 1,

            lastSync: null,
            _hasHydrated: false,
            isSubmitted: false,
            submissionStatus: 'idle',
            submissionError: null,
            totalScore: 0,
            lockMode: false,
            tabSwitches: 0,
            activeFormId: null,
            isLoadingQuestions: false,
            formSessionId: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            setFormData: (data) =>
                set((state) => ({
                    formData: { ...state.formData, ...data }
                })),
            setQuestions: (questions) => set({ questions, lastSync: Date.now() }),
            setSubmissionId: (submissionId) => set({ submissionId }),
            setCurrentStep: (step) => set({ currentStep: step }),
            setIsSubmitted: (isSubmitted) => set({ isSubmitted }),
            setHasHydrated: (status) => set({ _hasHydrated: status }),
            setSubmissionStatus: (status, error) => set({ submissionStatus: status, submissionError: error || null }),
            setTotalScore: (totalScore) => set({ totalScore }),
            setIsLoadingQuestions: (isLoading) => set({ isLoadingQuestions: isLoading }),
            setLockMode: (lockMode) => set({ lockMode }),
            setActiveFormId: (id) => set({ activeFormId: id }),
            incrementTabSwitches: () => set((state) => ({ tabSwitches: state.tabSwitches + 1 })),
            resetForm: () => set((state) => ({
                formData: {},
                submissionId: null,
                currentStep: 1,
                isSubmitted: false,
                submissionStatus: 'idle',
                submissionError: null,
                totalScore: 0,
                tabSwitches: 0,
                questions: state.questions,
                formSessionId: `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
            }))

        }),
        {
            name: 'form-storage',
            onRehydrateStorage: (state) => {
                return () => state?.setHasHydrated(true)
            },
            // Don't persist transient or sensitive loading states
            partialize: (state) => {
                const { 
                    isLoadingQuestions, 
                    submissionStatus, 
                    submissionError, 
                    isSubmitted,
                    ...persistedState 
                } = state
                return persistedState
            }
        }
    )
)
