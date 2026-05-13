import { scrollToItemAnchor } from '@shared/lib'

import { useCheckStore } from '../model/store'

/** Скролл к недавно добавленной позиции с учётом её индекса в списке (для корректной задержки stagger-анимации). */
export const scrollToAddedItem = (checkId: string, itemId: number): void => {
  const idx =
    useCheckStore
      .getState()
      .checks.find((c) => c.id === checkId)
      ?.items.findIndex((i) => i.id === itemId) ?? -1
  scrollToItemAnchor(checkId, itemId, { listItemIndex: Math.max(0, idx) })
}
