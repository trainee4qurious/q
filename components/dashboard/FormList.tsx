// components/dashboard/FormList.tsx
import { FormCard } from './FormCard'

interface Form {
    id: string
    title: string
    description?: string | null
    createdAt: Date
    responsesCount: number
}

interface FormListProps {
    forms: Form[]
}

export function FormList({ forms }: FormListProps) {
    if (forms.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-xl border-2 border-dashed border-gray-200">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900">No forms yet</h3>
                <p className="text-gray-500 mt-1">Create your first form to get started.</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
                <FormCard key={form.id} form={form} />
            ))}
        </div>
    )
}
