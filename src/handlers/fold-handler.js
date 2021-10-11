import { PLAYER_ACTIONS } from '../constants/player-actions.js';
import commonHandler from './commons/common-handler.js';
import actionsCommonHandler from './commons/actions-common-handler.js';
import rules from './rules.js';
import { ClientFriendlyException } from '../exceptions/ClientFriendlyException.js';
import API_STATUS_CODES from '../constants/api-status-codes.js';
import { PARTICIPATION_STATUSES } from '../constants/participation-statuses.js';

async function doFold (playerId, gameId) {
  console.log(`Performing fold for player ${playerId}`);

  const game = await commonHandler.getGame(gameId);

  const participantIndex =
    commonHandler.getParticipantIndex(game.participants, playerId);

  const participant = game.participants[participantIndex];
  commonHandler.assertIsCurrentTurn(participant);

  const gameActions = await actionsCommonHandler.findGameActionsForRound(gameId, game.round);
  if (!rules.canIFold(gameActions)) {
    throw new ClientFriendlyException(
      'You can not fold',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  participant.participationStatus = PARTICIPATION_STATUSES.FOLDED;
  commonHandler.switchParticipantTurn(game.participants, participantIndex);

  const newAction = {
    gameId,
    playerId,
    actionType: PLAYER_ACTIONS.FOLD,
    gameRound: game.round,
    chips: [],
    totalValue: 0
  };

  await commonHandler.updateGame(game);
  console.log(`Successfully updated game ${gameId}`);

  await actionsCommonHandler.createAction(newAction);
  console.log(`Successfully created action, type: "${PLAYER_ACTIONS.FOLD}" for player: ${playerId}`);
}

const foldHandler = { doFold };
export default foldHandler;
