import { useContext } from 'react'

import { StatShareContext } from './stat-share-context-value'
import type { TStatShareContextValue } from './stat-share-context-value'

export const useStatShareContext = (): TStatShareContextValue | null => useContext(StatShareContext)
