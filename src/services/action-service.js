import { get, getOrSet, set } from '../cache/client.js';
import actionRepository from '../repositories/action-repository.js';

async function create (action) {
  try {
    const newAction = await actionRepository.create(action);

    const cacheKey = generateCacheKey(action.gameId);
    const actionsInCache = await get(cacheKey) || [];
    await set(cacheKey, [...actionsInCache, newAction]);

    return newAction;
  } catch (err) {
    console.error('Failed to create action', err);
  }
}

async function findForGameRound (gameId, gameRound) {
  try {
    const cacheKey = generateCacheKey(gameId);
    return await getOrSet(cacheKey, () => actionRepository.findForGameRound(gameId, gameRound));
  } catch (err) {
    console.error('Failed to find actions', err);
  }
}

function generateCacheKey (gameId) {
  const cacheKey = 'actions';
  return `${cacheKey}_${gameId}`;
}

const actionService = { create, findForGameRound };
export default actionService;
