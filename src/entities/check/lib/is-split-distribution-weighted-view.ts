import type { TItem } from '../model/types'

import { hasWeightedSplitUnit } from './read-split-weight'

export const isSplitDistributionWeightedView = (item: TItem): boolean => {
  if (item.splitDistributionWeighted != null) return item.splitDistributionWeighted
  return hasWeightedSplitUnit(item.split)
}
