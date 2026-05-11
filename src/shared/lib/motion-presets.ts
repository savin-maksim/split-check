/**
 * Общие пресеты Framer Motion для списков, блоков и модалки.
 * Типы пресетов блока — `shared/types/motion-presets`.
 */

/** Timing для списка и стандартного блока (совпадают) */
const motionStandardTransition = {
  duration: 0.22,
  ease: [0.4, 0, 0.2, 1] as const,
}

/** Пресет элемента списка / блока с вертикальным сдвигом */
const motionPresetStandardItem = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 25,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -25,
  },
} as const

export const animatedListTransition = motionStandardTransition
export const animatedBlockTransition = motionStandardTransition

export const animatedListItemMotion = motionPresetStandardItem
export const animatedBlockMotion = motionPresetStandardItem

export const animatedBlockMotionPop = {
  initial: {
    opacity: 0,
    scale: 0.6,
  },
  animate: {
    opacity: 1,
    scale: 1,
  },
  exit: {
    opacity: 0,
    scale: 0.6,
  },
} as const

/** Затемнение слоя модалки (оверлей) */
export const modalOverlayFadeTransition = {
  duration: 0.2,
  ease: [0.4, 0, 0.2, 1] as const,
}

/** Панель: выезд снизу вверх и уход вниз при закрытии */
export const modalSheetTransition = {
  duration: 0.35,
  ease: [0.32, 0.72, 0, 1] as const,
}

export const modalSheetMotionFromTop = {
  initial: { y: '-50%' },
  animate: { y: '0' },
  exit: { y: '-50%' },
  transition: modalSheetTransition,
} as const

export const modalSheetMotionFromBottom = {
  initial: { y: '50%' },
  animate: { y: '0' },
  exit: { y: '50%' },
  transition: modalSheetTransition,
} as const
