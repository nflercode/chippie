import API_STATUS_CODES from '../constants/api-status-codes.js';
import { ClientFriendlyException } from '../exceptions/ClientFriendlyException.js';
import chipService from '../services/chip-service.js';
import chipsCommonHandler from './commons/chips-common-handler.js';
import commonHandler from './commons/common-handler.js';
import gameHandler from './game-handler.js';

async function exchange (tableId, playerId, chipsToAdd) {
  const ongoingGame = await gameHandler.getOngoingGame(tableId, playerId);
  const allChips = await chipService.getAllChips();

  chipsToAdd = chipsCommonHandler.mapBettingChipWithValue(chipsToAdd, allChips);

  const participantIndex = commonHandler.getParticipantIndex(ongoingGame.participants, playerId);
  const participant = ongoingGame.participants[participantIndex];

  const participantChips =
    chipsCommonHandler.mapBettingChipWithValue(participant.chips, allChips);

  const valueOfParticipantChips = chipsCommonHandler.getBettedValueFromChips(participantChips);
  const valueOfChipsToAdd = chipsCommonHandler.getBettedValueFromChips(chipsToAdd);
  if (valueOfChipsToAdd !== valueOfParticipantChips) {
    throw ClientFriendlyException(
      'Value of chips is mismatching',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  participant.chips = [];
  chipsCommonHandler.addChips(participant.chips, chipsToAdd);

  await commonHandler.updateGame(ongoingGame);
}

const exchangeChipsHandler = { exchange };
export default exchangeChipsHandler;
