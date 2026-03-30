const STORAGE_KEYS = {
  PEOPLE: 'splitcheck_people',
  COSTS: 'splitcheck_costs',
  PAYMENT_MODE: 'splitcheck_payment_mode',
  SINGLE_PAYER: 'splitcheck_single_payer',
  CURRENT_SESSION: 'splitcheck_current_session',
  STATS_CACHE: 'splitcheck_stats_cache',
  SAVED_CHECKS: 'splitcheck_saved_checks',
  SESSION_META: 'splitcheck_session_meta',
  TRANSFER_MERGE_UI: 'splitcheck_transfer_merge_ui',
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

  /**
   * Кеш снимка статистики/переводов для страницы статистики.
   * @returns {{ dataFingerprint: string, fullFingerprint: string, statistics: object, transfers: object[] } | null}
   */
  getStatsCache: () => safeParse(STORAGE_KEYS.STATS_CACHE, null),

  setStatsCache: (payload) => {
    localStorage.setItem(STORAGE_KEYS.STATS_CACHE, JSON.stringify(payload))
  },

  clearStatsCache: () => {
    localStorage.removeItem(STORAGE_KEYS.STATS_CACHE)
  },

  /** @returns {Array<{ id: string, title: string, createdAt: number, people: object[], costs: object[], paymentMode: string, singlePayer: object | null }>} */
  getSavedChecks: () => safeParse(STORAGE_KEYS.SAVED_CHECKS, []),

  setSavedChecks: (checks) => {
    localStorage.setItem(STORAGE_KEYS.SAVED_CHECKS, JSON.stringify(checks))
  },

  /**
   * Метаданные активного редактируемого чека (имя, id для связи со снимком).
   * @returns {{ id: string, title: string } | null}
   */
  getSessionMeta: () => safeParse(STORAGE_KEYS.SESSION_META, null),

  /** @param {{ id: string, title: string } | null} meta */
  setSessionMeta: (meta) => {
    if (meta == null) {
      localStorage.removeItem(STORAGE_KEYS.SESSION_META)
    } else {
      localStorage.setItem(STORAGE_KEYS.SESSION_META, JSON.stringify(meta))
    }
  },

  /**
   * UI режима объединения переводов на странице статистики.
   * @returns {{
   *   mergeMode: boolean,
   *   pendingSelection?: number[],
   *   selectedIndices?: number[],
   *   committedGroups?: number[][],
   *   transfersSig: string
   * } | null}
   */
  getTransferMergeUi: () => safeParse(STORAGE_KEYS.TRANSFER_MERGE_UI, null),

  /**
   * @param {{
   *   mergeMode: boolean,
   *   pendingSelection: number[],
   *   committedGroups: number[][],
   *   transfersSig: string
   * }} payload
   */
  setTransferMergeUi: (payload) => {
    localStorage.setItem(STORAGE_KEYS.TRANSFER_MERGE_UI, JSON.stringify(payload))
  },

  getCurrentSession: () => {
    return localStorage.getItem(STORAGE_KEYS.CURRENT_SESSION)
  },

  setCurrentSession: (sessionId) => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_SESSION, sessionId)
  },

  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  },
}
