import { create } from 'zustand'

type TNavActionStore = {
  onAction: (() => void) | null
  setOnAction: (fn: (() => void) | null) => void
}

export const useNavActionStore = create<TNavActionStore>((set) => ({
  onAction: null,
  setOnAction: (fn) => set({ onAction: fn }),
}))
