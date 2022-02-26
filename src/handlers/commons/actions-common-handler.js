import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import actionService from '../../services/action-service.js';

async function createAction (action) {
  const newAction = await actionService.create(action);
  if (!newAction) {
    console.error(`Failed to create action on game ${action.gameId} of type ${action.actionType}`);
    throw new ClientFriendlyException(
      'Failed to create action',
      API_STATUS_CODES.INTERNAL_ERROR
    );
  }
}

async function findGameActionsForRound (gameId, round) {
  const gameActions = await actionService.findForGameRound(gameId, round);
  if (!gameActions) {
    throw new ClientFriendlyException(
      'Could not find any game actions for this round',
      API_STATUS_CODES.BAD_REQUEST
    );
  }
  return gameActions;
}

const actionsCommonHandler = { createAction, findGameActionsForRound };
export default actionsCommonHandler;
