import { useParams } from 'react-router-dom'

import { useCheckStore } from '@/entities/check/model/store'

export const useCurrentCheckFromRoute = () => {
  const { checkId } = useParams<{ checkId: string }>()
  const check = useCheckStore((s) => s.checks.find((c) => c.id === checkId))
  return { check, checkId: checkId ?? '' }
}
