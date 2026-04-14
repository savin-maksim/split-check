export { useCheckStore } from './model'
export { EPaymentMode } from './model'
export type { TCheck, TCheckStore, TItem, TPerson, TTransfer } from './model'
export {
  getItemTotal,
  calculateBalances,
  generateTransfers,
  checkToProducts,
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
} from './lib'
export type { TDisplayTransfer } from './lib'
