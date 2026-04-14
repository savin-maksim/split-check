import {
  bignumber,
  add,
  subtract,
  multiply,
  divide,
  compare,
  round,
  number as toNumber,
  min as mathMin,
  abs as mathAbs,
  larger,
  smaller,
  equal,
} from 'mathjs'
import type { BigNumber } from 'mathjs'

export {
  bignumber,
  add,
  subtract,
  multiply,
  divide,
  compare,
  round,
  toNumber,
  mathMin,
  mathAbs,
  larger,
  smaller,
  equal,
}

export type { BigNumber }

export const roundForDisplay = (value: BigNumber): number => toNumber(round(value, 2)) as number
