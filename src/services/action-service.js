import actionRepository from "../repositories/action-repository.js";

async function createAction(gameId, playerId, chips, actionType) {
  try {
    return await actionRepository.createAction(gameId, playerId, chips, actionType);
  } catch(err) {
    console.error('Failed to create acion', err);
  }
}

const actionService = { createAction };
export default actionService;