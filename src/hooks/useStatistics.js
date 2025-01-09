import { useState, useEffect, useCallback } from 'react'
import { calculateStatistics } from '../utils/calculations'

export function useStatistics(people, costs) {
  const [statistics, setStatistics] = useState({
    peopleStats: [],
    totalStats: {
      totalAmount: 0,
      expenses: []
    }
  })
  const [isCalculating, setIsCalculating] = useState(false)

  const calculateStats = useCallback(() => {
    if (people?.length && costs?.length) {
      const stats = calculateStatistics(people, costs)
      setStatistics(stats)
    } else {
      setStatistics({
        peopleStats: [],
        totalStats: {
          totalAmount: 0,
          expenses: []
        }
      })
    }
    setIsCalculating(false)
  }, [people, costs])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  return { statistics, isCalculating }
} 