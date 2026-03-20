import { useState, useEffect, useMemo } from 'react'
import { StorageService } from '../services/storage'
import { calculateStatistics } from '../utils/calculations'
import { getTransfersFromCosts } from '../utils/splitCompute'
import {
  computeDataFingerprint,
  computeFullFingerprint
} from '../utils/statsFingerprint'

const emptyStatistics = {
  peopleStats: [],
  totalStats: {
    totalAmount: 0,
    expenses: []
  }
}

/**
 * Расчёт переводов и статистики только при монтировании / смене зависимостей
 * на странице статистики. Кеш в localStorage: при смене только режима оплаты
 * пересчитываются только переводы (getTransfersFromCosts).
 */
export function useStatsPageSnapshot(people, costs, paymentMode, singlePayer) {
  const [transfers, setTransfers] = useState([])
  const [statistics, setStatistics] = useState(null)
  const [ready, setReady] = useState(false)

  const stableEmpty = useMemo(() => emptyStatistics, [])

  useEffect(() => {
    if (!people?.length || !costs?.length) {
      setTransfers([])
      setStatistics(stableEmpty)
      setReady(true)
      return
    }

    setReady(false)

    const dataFingerprint = computeDataFingerprint(people, costs)
    const fullFingerprint = computeFullFingerprint(
      dataFingerprint,
      paymentMode,
      singlePayer
    )
    const cache = StorageService.getStatsCache()

    let nextTransfers
    let nextStatistics

    if (!cache || cache.dataFingerprint !== dataFingerprint) {
      nextStatistics = calculateStatistics(people, costs)
      nextTransfers = getTransfersFromCosts(
        people,
        costs,
        paymentMode,
        singlePayer
      )
      StorageService.setStatsCache({
        dataFingerprint,
        fullFingerprint,
        statistics: nextStatistics,
        transfers: nextTransfers
      })
    } else if (cache.fullFingerprint !== fullFingerprint) {
      nextStatistics = cache.statistics
      nextTransfers = getTransfersFromCosts(
        people,
        costs,
        paymentMode,
        singlePayer
      )
      StorageService.setStatsCache({
        ...cache,
        fullFingerprint,
        transfers: nextTransfers
      })
    } else {
      nextStatistics = cache.statistics
      nextTransfers = cache.transfers
    }

    setStatistics(nextStatistics)
    setTransfers(nextTransfers)
    setReady(true)
  }, [people, costs, paymentMode, singlePayer, stableEmpty])

  return { transfers, statistics, ready }
}
