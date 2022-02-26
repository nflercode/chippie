import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import commonHandler from '../commons/common-handler.js';
import gameService from '../../services/game-service.js';

async function getOngoingGame (tableId, playerId) {
  const ongoingGame = await gameService.get(tableId);
  if (!ongoingGame) {
    throw new ClientFriendlyException(
      'No ongoing game was found',
      API_STATUS_CODES.NOT_FOUND
    );
  }

  // Assert is member of game
  commonHandler.getParticipantIndex(ongoingGame.participants, playerId);

  return ongoingGame;
}

const getOngoingGameHandler = { getOngoingGame };
export default getOngoingGameHandler;
