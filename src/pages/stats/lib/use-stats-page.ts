import { useState, useEffect } from 'react'

import { useNavActionStore } from '@/shared/lib'

export const useStatsPage = () => {
  const [isShareOpen, setIsShareOpen] = useState(false)
  const setNavAction = useNavActionStore((s) => s.setOnAction)

  useEffect(() => {
    setNavAction(() => setIsShareOpen(true))
    return () => setNavAction(null)
  }, [setNavAction])

  return { isShareOpen, setIsShareOpen }
}
