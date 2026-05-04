export type TAnimatedBlockMotion = {
  initial: {
    opacity: number
    scale: number
    y: number
  }
  animate: {
    opacity: number
    scale: number
    y: number
  }
  exit: {
    opacity: number
    scale: number
    y: number
  }
}

export type TAnimatedBlockMotionPop = {
  initial: {
    opacity: number
    scale: number
  }
  animate: {
    opacity: number
    scale: number
  }
  exit: {
    opacity: number
    scale: number
  }
}

export type TAnimatedBlockMotionPreset = TAnimatedBlockMotion | TAnimatedBlockMotionPop
