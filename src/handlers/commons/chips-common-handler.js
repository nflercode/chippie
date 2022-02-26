import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import chipService from '../../services/chip-service.js';

function subtract (chips, chipsToSubtract) {
  const chipsSubtracted = chips;

  chipsToSubtract.forEach(chipToSubtract => {
    const chipIndex = chipsSubtracted.findIndex(c => c.chipId === chipToSubtract.chipId);
    if (chipIndex === -1) {
      throw new ClientFriendlyException(
        'Participant tried to subtract chip that doesn\'t exist.',
        API_STATUS_CODES.BAD_REQUEST
      );
    }

    const chip = chipsSubtracted[chipIndex];
    const newAmount = chip.amount - chipToSubtract.amount;
    if (newAmount < 0) {
      throw new ClientFriendlyException(
        'Participant tried to subtract too many chips',
        API_STATUS_CODES.BAD_REQUEST
      );
    }

    chipsSubtracted[chipIndex].amount = newAmount;
  });

  return chipsSubtracted;
}

function add (chips, chipsToAdd) {
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

async function mapWithValue (chips) {
  const valueChips = await chipService.getAllChips();
  return chips.map((chip) => {
    const actualChip = valueChips.find(({ id }) => id === chip.chipId);
    if (!actualChip) {
      throw new ClientFriendlyException(
        'Tried to map chip with value of unknown chip',
        API_STATUS_CODES.BAD_REQUEST
      );
    }

    return {
      ...chip,
      value: actualChip.value
    };
  });
}

function getTotalValue (chips = []) {
  return chips.reduce((acc, curr) => acc + (curr.value * curr.amount), 0);
}

const chipsCommonHandler = {
  subtract,
  add,
  mapWithValue,
  getTotalValue
};
export default chipsCommonHandler;
