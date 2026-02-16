const STORAGE_KEYS = {
  PEOPLE: 'splitcheck_people',
  COSTS: 'splitcheck_costs',
  PAYMENT_MODE: 'splitcheck_payment_mode',
  SINGLE_PAYER: 'splitcheck_single_payer',
  CURRENT_SESSION: 'splitcheck_current_session'
}

const safeParse = (key, fallback) => {
  try {
    const data = localStorage.getItem(key)
    return data ? JSON.parse(data) : fallback
  } catch (error) {
    console.error(`Error parsing ${key} from localStorage:`, error)
    return fallback
  }
}

export const StorageService = {
  getPeople: () => safeParse(STORAGE_KEYS.PEOPLE, []),

  setPeople: (people) => {
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people))
  },

  getCosts: () => safeParse(STORAGE_KEYS.COSTS, []),

  setCosts: (costs) => {
    localStorage.setItem(STORAGE_KEYS.COSTS, JSON.stringify(costs))
  },

  getPaymentMode: () => {
    return localStorage.getItem(STORAGE_KEYS.PAYMENT_MODE) || 'manual'
  },

  setPaymentMode: (mode) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_MODE, mode)
  },

  getSinglePayer: () => safeParse(STORAGE_KEYS.SINGLE_PAYER, null),

  setSinglePayer: (payer) => {
    localStorage.setItem(STORAGE_KEYS.SINGLE_PAYER, JSON.stringify(payer))
  },

  getCurrentSession: () => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)
  },

  setCurrentSession: (sessionId) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId)
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key)
    })
  }
}
