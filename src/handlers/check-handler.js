import { PLAYER_ACTIONS } from '../constants/player-actions.js';
import commonHandler from './commons/common-handler.js';
import actionsCommonHandler from './commons/actions-common-handler.js';
import { ClientFriendlyException } from '../exceptions/ClientFriendlyException.js';
import API_STATUS_CODES from '../constants/api-status-codes.js';
import rules from './rules.js';

async function doCheck (playerId, gameId) {
  console.log(`Performing check for player ${playerId}`);

  const game = await commonHandler.getGame(gameId);
  const participantIndex = commonHandler.getParticipantIndex(game.participants, playerId);

  const participant = game.participants[participantIndex];
  commonHandler.assertIsCurrentTurn(participant);

  const roundActions = await actionsCommonHandler.findGameActionsForRound(gameId, game.round);
  const [canICheck, totalBettedValue] = rules.canICheck(roundActions, playerId);
  if (!canICheck) {
    throw new ClientFriendlyException(
      'You can not check',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  commonHandler.switchParticipantTurn(game.participants, participantIndex);
  console.log(totalBettedValue);

  const newAction = {
    gameId,
    playerId,
    actionType: PLAYER_ACTIONS.CHECK,
    gameRound: game.round,
    chips: [],
    bettedValue: 0,
    totalBettedValue
  };

  await commonHandler.updateGame(game);
  console.log(`Successfully updated game ${gameId}`);

  await actionsCommonHandler.createAction(newAction);

  console.log(`Successfully created action, type: "${PLAYER_ACTIONS.CHECK}" for player: ${playerId}`);
}

const checkHandler = { doCheck };
export default checkHandler;
