import { useState, useCallback } from 'react'

import { useRegisterNavAction } from '@/widgets/w-bottom-nav'

export const useStatsPageHandlers = () => {
  const [isShareOpen, setIsShareOpen] = useState(false)

  useRegisterNavAction(useCallback(() => setIsShareOpen(true), []))

  return { isShareOpen, setIsShareOpen }
}
