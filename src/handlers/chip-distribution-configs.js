import { CHIP_TYPES } from "../constants/chip-types.js"

export const DEFAULT_DISTRIBUTION = {
  [CHIP_TYPES.WHITE]: {
    amount: 10
  },
  [CHIP_TYPES.RED]: {
    amount: 10
  },
  [CHIP_TYPES.BLUE]: {
    amount: 9
  },
  [CHIP_TYPES.GREEN]: {
    amount: 2
  }
}