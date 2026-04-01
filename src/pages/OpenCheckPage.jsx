import { useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { useApp } from '../context/AppContext'
import { StorageService } from '../services/storage'

/** Открывает чек по id из URL и возвращает на список чеков. */
function OpenCheckPage() {
  const { checkId } = useParams()
  const navigate = useNavigate()
  const { applySessionSnapshot } = useApp()

  useEffect(() => {
    if (!checkId) {
      navigate('/', { replace: true })
      return
    }
    const checks = StorageService.getSavedChecks()
    const check = checks.find((c) => c.id === checkId)
    if (!check) {
      toast.error('Чек не найден', { id: `open-check-missing-${checkId}` })
      navigate('/', { replace: true })
      return
    }
    applySessionSnapshot(check)
    toast.success(`Открыто: ${check.title}`, { id: `open-check-${checkId}` })
    navigate('/', { replace: true })
  }, [checkId, navigate, applySessionSnapshot])

  return null
}

export default OpenCheckPage
