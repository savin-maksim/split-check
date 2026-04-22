import type { TItem } from '../model/types'

export const isSplitDistributionWeightedView = (item: TItem): boolean => {
  if (item.splitDistributionWeighted != null) return item.splitDistributionWeighted
  return Object.values(item.split).some((w) => w > 1)
}
