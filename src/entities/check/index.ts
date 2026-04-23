export { useCheckStore } from './model'
export { EPaymentMode } from './model'
export type { TCheck, TCheckStore, TItem, TPerson, TTransfer } from './model'
export {
  getItemTotal,
  isSplitDistributionWeightedView,
  calculateBalances,
  generateTransfers,
  checkToProducts,
  getEffectivePayerId,
  validatePersonName,
  validateItemTitle,
  validateItemPrice,
  useCurrentCheck,
  useCheckBalances,
  transferListSignature,
  getRecipientCounts,
  isEligibleForMerge,
  validateCommittedGroups,
  canMergeSelection,
  applyMerge,
  canUnmergeSelection,
  applyUnmerge,
  buildDisplayTransfers,
  calculatePersonStats,
} from './lib'
export type { TDisplayTransfer, TPersonStats, TExpenseItem } from './lib'
