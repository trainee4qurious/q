// lib/store/use-ui-store.ts
import { create } from 'zustand'

interface UIStore {
    isCreateModalOpen: boolean
    setIsCreateModalOpen: (open: boolean) => void
    selectedFormId: string | null
    setSelectedFormId: (id: string | null) => void
}

export const useUIStore = create<UIStore>((set) => ({
    isCreateModalOpen: false,
    setIsCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
    selectedFormId: null,
    setSelectedFormId: (id) => set({ selectedFormId: id }),
}))
