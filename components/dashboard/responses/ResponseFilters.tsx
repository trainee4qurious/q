'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useCallback } from 'react'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SortAsc, Filter } from 'lucide-react'

export function ResponseFilters() {
    const router = useRouter()
    const pathname = usePathname()
    const searchParams = useSearchParams()

    const createQueryString = useCallback(
        (name: string, value: string) => {
            const params = new URLSearchParams(searchParams.toString())
            if (value) {
                params.set(name, value)
            } else {
                params.delete(name)
            }
            // Reset to page 1 when filters change
            if (name !== 'page') {
                params.delete('page')
            }
            return params.toString()
        },
        [searchParams]
    )

    const handleSortChange = (value: string) => {
        const [sortBy, sortOrder] = value.split('-')
        const params = new URLSearchParams(searchParams.toString())
        params.set('sortBy', sortBy)
        params.set('sortOrder', sortOrder)
        params.delete('page')
        router.push(`${pathname}?${params.toString()}`)
    }

    const handleFilterChange = (name: string, value: string) => {
        router.push(`${pathname}?${createQueryString(name, value)}`)
    }

    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const sortValue = `${sortBy}-${sortOrder}`

    return (
        <div className="flex flex-col md:flex-row gap-4 mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
            <div className="flex-1 space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <SortAsc className="h-3 w-3" /> Sort By
                </Label>
                <Select value={sortValue} onChange={(e) => handleSortChange(e.target.value)}>
                    <option value="createdAt-desc">Newest First</option>
                    <option value="createdAt-asc">Oldest First</option>
                    <option value="score-desc">Highest Score</option>
                    <option value="score-asc">Lowest Score</option>
                </Select>
            </div>

            <div className="flex-1 space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Filter className="h-3 w-3" /> Min Score
                </Label>
                <Input
                    type="number"
                    placeholder="Min score"
                    className="w-full md:w-[120px] bg-background"
                    defaultValue={searchParams.get('minScore') || ''}
                    onBlur={(e) => handleFilterChange('minScore', e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleFilterChange('minScore', (e.target as HTMLInputElement).value)
                        }
                    }}
                />
            </div>

            <div className="flex-1 space-y-2">
                <Label className="text-xs font-semibold uppercase text-muted-foreground flex items-center gap-2">
                    <Filter className="h-3 w-3" /> Max Score
                </Label>
                <Input
                    type="number"
                    placeholder="Max score"
                    className="w-full md:w-[120px] bg-background"
                    defaultValue={searchParams.get('maxScore') || ''}
                    onBlur={(e) => handleFilterChange('maxScore', e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            handleFilterChange('maxScore', (e.target as HTMLInputElement).value)
                        }
                    }}
                />
            </div>

            <div className="flex items-end">
                <button
                    onClick={() => router.push(pathname)}
                    className="text-xs text-muted-foreground hover:text-primary transition-colors pb-3 px-2"
                >
                    Reset Filters
                </button>
            </div>
        </div>
    )
}
