import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import chipsCommonHandler from '../commons/chips-common-handler.js';
import commonHandler from '../commons/common-handler.js';
import gameHandler from '../game-handler.js';

async function exchange (tableId, playerId, chipsToAdd) {
  const ongoingGame = await gameHandler.getOngoingGame(tableId, playerId);
  const [participant] = commonHandler.getParticipant(ongoingGame.participants, playerId);

  const { mapWithValue, getTotalValue } = chipsCommonHandler;
  const [valueOfChipsToAdd, valueOfParticipantChips] = await Promise.all([
    mapWithValue(chipsToAdd).then(getTotalValue),
    mapWithValue(participant.chips).then(getTotalValue)
  ]);

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
