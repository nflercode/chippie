import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';

function subtractChips (chips, chipsToSubtract) {
  const chipsSubtracted = chips;

  chipsToSubtract.forEach(chipToSubtract => {
    const chipIndex = chipsSubtracted.findIndex(c => c.chipId === chipToSubtract.chipId);
    if (chipIndex === -1) {
      throw new ClientFriendlyException(
        'Participant tried to bet chip that whom does not have',
        API_STATUS_CODES.BAD_REQUEST
      );
    }
    const chip = chipsSubtracted[chipIndex];

    const newAmount = chip.amount - chipToSubtract.amount;

    if (newAmount < 0) {
      throw new ClientFriendlyException(
        'Participant tried to bet too many chips',
        API_STATUS_CODES.BAD_REQUEST
      );
    }

    chipsSubtracted[chipIndex].amount = newAmount;
  });

  return chipsSubtracted;
}

function addChips (chips, chipsToAdd) {
  const chipsAdded = chips;

  chipsToAdd.forEach(chipToAdd => {
    const chipIndex = chipsAdded.findIndex(c => c.chipId === chipToAdd.chipId);
    const chip = chipIndex === -1 ? { chipId: chipToAdd.chipId, amount: 0 } : chipsAdded[chipIndex];

    chip.amount = chip.amount + chipToAdd.amount;

    if (chipIndex === -1) {
      chipsAdded.push(chip);
    } else {
      chipsAdded[chipIndex] = chip;
    }
  });

  return chipsAdded;
}

function mapBettingChipWithValue (bettingChips, actualChips) {
  return bettingChips.map((bettingChip) => {
    const actualChip = actualChips.find((actualChip) => actualChip.id === bettingChip.chipId);
    if (!actualChip) {
      throw new ClientFriendlyException(
        'Unknown chip',
        API_STATUS_CODES.BAD_REQUEST
      );
    }

    return {
      ...bettingChip,
      value: actualChip.value
    };
  });
}

function getTotalValueFromChips (chips = []) {
  return chips.reduce((acc, curr) => acc + (curr.value * curr.amount), 0);
}

const chipsCommonHandler = {
  subtractChips,
  addChips,
  mapBettingChipWithValue,
  getTotalValueFromChips
};
export default chipsCommonHandler;
