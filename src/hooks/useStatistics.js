import { useState, useEffect } from 'react'
import { calculateStatistics } from '../utils/calculations'

export function useStatistics(people, costs) {
  const [statistics, setStatistics] = useState({
    peopleStats: [],
    totalStats: {
      totalAmount: 0,
      expenses: []
    }
  })

  useEffect(() => {
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
  }, [people, costs])

  return statistics
} 