import * as React from 'react'
import { getFormResponses } from '@/app/actions/form-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChevronLeft, Search } from 'lucide-react'
import Link from 'next/link'
import { format } from 'date-fns'
import { DeleteResponseButton, DeleteAllResponsesButton } from '@/components/dashboard/responses/ResponseActions'
import { ResponseFilters } from '@/components/dashboard/responses/ResponseFilters'
import { Pagination } from '@/components/dashboard/responses/Pagination'

interface PageProps {
    params: Promise<{ id: string }>
    searchParams: Promise<{
        page?: string
        sortBy?: string
        sortOrder?: string
        minScore?: string
        maxScore?: string
    }>
}

export default async function ResponsesPage({ params, searchParams }: PageProps) {
    const { id } = await params
    const sParams = await searchParams

    const options = {
        page: sParams.page ? parseInt(sParams.page) : 1,
        sortBy: (sParams.sortBy as any) || 'createdAt',
        sortOrder: (sParams.sortOrder as any) || 'desc',
        minScore: sParams.minScore ? parseInt(sParams.minScore) : undefined,
        maxScore: sParams.maxScore ? parseInt(sParams.maxScore) : undefined,
    }

    let result;
    try {
        result = await getFormResponses(id, options)
    } catch (error: any) {
        if (error.message?.toLowerCase().includes('unauthorized')) {
            return (
                <div className="container mx-auto py-20 px-4 max-w-md text-center">
                    <div className="bg-destructive/10 text-destructive p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                        <ChevronLeft className="h-8 w-8" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight mb-2">Unauthorized Access</h1>
                    <p className="text-muted-foreground mb-8">
                        Please login through the account that created this form to view its responses.
                    </p>
                    <Link href="/login">
                        <Button className="w-full">
                            Login through that account
                        </Button>
                    </Link>
                    <Link href="/dashboard" className="block mt-4 text-sm text-muted-foreground hover:text-foreground">
                        Back to Dashboard
                    </Link>
                </div>
            )
        }
        throw error
    }

    const { responses, pagination, questions, title } = result
    const headers = questions.map(q => ({
        id: q.id,
        text: q.text
    }))

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                        <p className="text-muted-foreground mt-1">
                            View and manage responses for this form
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <DeleteAllResponsesButton formId={id} disabled={responses.length === 0 && pagination.total === 0} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Filtered Responses</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{pagination.total}</div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Average Score (Filtered)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">
                            {responses.length > 0
                                ? (responses.reduce((acc, r) => acc + (r.score || 0), 0) / responses.length).toFixed(1)
                                : 'N/A'}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-primary/5 border-primary/10">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase">Showing Page</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl font-semibold">
                            {pagination.page} of {pagination.totalPages || 1}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <React.Suspense fallback={<div className="h-32 w-full animate-pulse bg-muted/50 rounded-lg mb-6" />}>
                <ResponseFilters />
            </React.Suspense>

            <Card className="overflow-hidden border-border shadow-sm">
                <CardHeader className="bg-muted/30 border-b py-4">
                    <CardTitle className="text-lg flex items-center gap-2">
                        All Submissions
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left border-collapse">
                            <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b">
                                <tr>
                                    <th className="px-6 py-4 font-medium sticky left-0 bg-muted/20">Submitted At</th>
                                    {headers.map(h => (
                                        <th key={h.id} className="px-6 py-4 font-medium min-w-[200px]">{h.text}</th>
                                    ))}
                                    <th className="px-6 py-4 font-medium">Score</th>
                                    <th className="px-6 py-4 font-medium">Switches</th>
                                    <th className="px-6 py-4 font-medium">Legacy Data</th>
                                    <th className="px-6 py-4 font-medium w-[80px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {responses.length === 0 ? (
                                    <tr>
                                        <td colSpan={headers.length + 5} className="px-6 py-12 text-center text-muted-foreground italic">
                                            No responses found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    responses.map((response) => {
                                        const data = response.data as Record<string, any>
                                        return (
                                            <tr key={response.id} className="hover:bg-muted/10 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap font-medium text-muted-foreground sticky left-0 bg-background border-r">
                                                    {format(new Date(response.createdAt), 'MMM d, p')}
                                                </td>
                                                {headers.map(h => {
                                                    let answer = data[h.id]
                                                    return (
                                                        <td key={h.id} className="px-6 py-4">
                                                            {renderAnswer(answer)}
                                                        </td>
                                                    )
                                                })}
                                                <td className="px-6 py-4">
                                                    {response.score !== null ? (
                                                        <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                                                            {response.score}
                                                        </span>
                                                    ) : '-'}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {response.tabSwitches > 0 ? (
                                                        <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700 border border-red-200">
                                                            {response.tabSwitches} switches
                                                        </span>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">—</span>
                                                    )}
                                                </td>
                                                {/* Fallback column for mismatched data */}
                                                <td className="px-6 py-4 text-xs text-muted-foreground max-w-[150px] truncate">
                                                    {Object.keys(data).filter(k => !headers.find(h => h.id === k)).length > 0 && (
                                                        <details className="cursor-pointer">
                                                            <summary className="hover:text-foreground">View Hidden</summary>
                                                            <div className="p-2 bg-muted/50 rounded mt-1 whitespace-pre-wrap">
                                                                {JSON.stringify(Object.fromEntries(Object.entries(data).filter(([k]) => !headers.find(h => h.id === k))), null, 2)}
                                                            </div>
                                                        </details>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <DeleteResponseButton responseId={response.id} />
                                                </td>
                                            </tr>
                                        )
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination totalPages={pagination.totalPages} currentPage={pagination.page} />
                </CardContent>
            </Card>
        </div>
    )
}

function renderAnswer(answer: any) {
    if (answer === undefined || answer === null) return <span className="text-muted-foreground/30">—</span>
    if (Array.isArray(answer)) return answer.join(', ')

    if (typeof answer === 'string') {
        let displayUrl = answer
        // Redirect local /uploads/ to /api/uploads/ for more robust serving
        if (answer.startsWith('/uploads/')) {
            displayUrl = answer.replace('/uploads/', '/api/uploads/')
        }

        const lowerAnswer = displayUrl.toLowerCase()
        if ((lowerAnswer.startsWith('http') || lowerAnswer.startsWith('/api/uploads/')) && (
            lowerAnswer.endsWith('.jpg') ||
            lowerAnswer.endsWith('.jpeg') ||
            lowerAnswer.endsWith('.png') ||
            lowerAnswer.endsWith('.gif') ||
            lowerAnswer.endsWith('.webp') ||
            lowerAnswer.includes('firebasestorage') || // common for file uploads
            lowerAnswer.includes('amazonaws.com') ||
            lowerAnswer.includes('supabase.co') ||
            lowerAnswer.startsWith('/api/uploads/')
        )) {
            return (
                <a
                    href={displayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-16 h-16 rounded overflow-hidden border border-border bg-muted hover:opacity-80 transition-opacity cursor-zoom-in"
                >
                    <img src={displayUrl} alt="Uploaded" className="w-full h-full object-cover" />
                </a>
            )
        }
        return answer
    }

    if (typeof answer === 'object') return JSON.stringify(answer)
    return String(answer)
}
