const STORAGE_KEYS = {
  PAYMENT_MODE: 'splitcheck_payment_mode',
  SINGLE_PAYER: 'splitcheck_single_payer',
  CURRENT_SESSION: 'splitcheck_current_session'
}

export const StorageService = {
  getPaymentMode: () => {
    return localStorage.getItem(STORAGE_KEYS.PAYMENT_MODE) || 'manual'
  },

  setPaymentMode: (mode) => {
    localStorage.setItem(STORAGE_KEYS.PAYMENT_MODE, mode)
  },

  getSinglePayer: () => {
    const data = localStorage.getItem(STORAGE_KEYS.SINGLE_PAYER)
    return data ? JSON.parse(data) : null
  },

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