import actionRepository from '../repositories/action-repository.js';

async function createAction (newAction) {
  try {
    return await actionRepository.createAction(newAction);
  } catch (err) {
    console.error('Failed to create action', err);
  }
}

async function findActionsForGame (gameId, gameRound) {
  try {
    return await actionRepository.findActionsForGame(gameId, gameRound);
  } catch (err) {
    console.error('Failed to find actions', err);
  }
}

const actionService = { createAction, findActionsForGame };
export default actionService;
