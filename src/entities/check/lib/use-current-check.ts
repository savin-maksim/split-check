import { useParams } from 'react-router-dom'

import { useCheckStore } from '../model/store'

export const useCurrentCheck = () => {
  const { checkId } = useParams<{ checkId: string }>()
  const check = useCheckStore((s) => s.checks.find((c) => c.id === checkId))
  return { check, checkId: checkId ?? '' }
}
