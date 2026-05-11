import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { useCheckStore } from '@/entities/check/model/store'
import { buildRoute } from '@/shared/constants'

export const useCurrentCheckFromRoute = () => {
  const { checkId } = useParams<{ checkId: string }>()
  const navigate = useNavigate()
  const check = useCheckStore((s) => s.checks.find((c) => c.id === checkId))

  useEffect(() => {
    if (checkId && !check) {
      navigate(buildRoute.checksList(), { replace: true })
    }
  }, [check, checkId, navigate])

  return { check, checkId: checkId ?? '' }
}
