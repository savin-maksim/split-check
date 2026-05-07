import { animatedListTransition } from './motion-presets'

/** Совместимо с `AnimatedList` на странице позиций (`ItemsListWithSearch`): initialDelay / staggerDelay */
const ITEMS_LIST_INITIAL_DELAY_S = 0.05
const ITEMS_LIST_STAGGER_DELAY_S = 0.05

type TScrollBehavior = 'auto' | 'smooth' | 'instant'

const scheduleScrollToElementById = (
  id: string,
  options?: { settleMs?: number; behavior?: TScrollBehavior },
) => {
  const settleMs = options?.settleMs ?? 0
  const behavior = options?.behavior ?? 'smooth'

  const run = () => {
    document.getElementById(id)?.scrollIntoView({ behavior, block: 'start' })
  }

  if (settleMs > 0) {
    queueMicrotask(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          window.setTimeout(run, settleMs)
        })
      })
    })
    return
  }

  queueMicrotask(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(run)
    })
  })
}

/** Время до завершения входной анимации строки списка позиций (stagger + duration). */
export const getItemsListAnchorSettleMs = (listItemIndex: number): number => {
  const delayBeforeMotion =
    ITEMS_LIST_INITIAL_DELAY_S + ITEMS_LIST_STAGGER_DELAY_S * Math.max(0, listItemIndex)
  return Math.ceil((delayBeforeMotion + animatedListTransition.duration + 0.03) * 1000)
}

export type TScrollToItemAnchorOptions = {
  /** Индекс в `check.items` (порядок как на странице без фильтра поиска). */
  listItemIndex: number
}

export const getItemAnchorId = (checkId: string, itemId: number) => `check-${checkId}-item-${itemId}`

/**
 * Скролл к карточке позиции после мутации списка.
 * Учитывает stagger входной анимации `AnimatedList` и использует `behavior: 'auto'`, чтобы не конфликтовать с motion.
 */
export const scrollToItemAnchor = (
  checkId: string,
  itemId: number,
  options: TScrollToItemAnchorOptions,
) => {
  const settleMs = getItemsListAnchorSettleMs(Math.max(0, options.listItemIndex))
  scheduleScrollToElementById(getItemAnchorId(checkId, itemId), {
    settleMs,
    behavior: 'auto',
  })
}

export const getPersonStatsAnchorId = (checkId: string, personId: number) =>
  `check-${checkId}-person-stats-${personId}`

export const scrollToPersonStatsAnchor = (checkId: string, personId: number) => {
  scheduleScrollToElementById(getPersonStatsAnchorId(checkId, personId), { behavior: 'smooth' })
}
