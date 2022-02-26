import { getOrSet, set, del as delInCache } from '../cache/client.js';
import gameRepository from '../repositories/game-repository.js';

async function create (tableId, participants, createdByPlayerId) {
  try {
    const createdGame = await gameRepository.create(tableId, participants, createdByPlayerId);

    const cacheKeyWithTableId = generateCacheKey(tableId);
    await set(cacheKeyWithTableId, createdGame);

    return createdGame;
  } catch (err) {
    console.error('Failed to create game.', err);
  }
}

async function get (tableId) {
  try {
    const cacheKeyWithTableId = generateCacheKey(tableId);
    return await getOrSet(cacheKeyWithTableId, async () => {
      const games = gameRepository.find(tableId);
      return games[0];
    });
  } catch (err) {
    console.error('Failed to get ongoing game for tableId', tableId);
  }
}

async function update (game) {
  try {
    const updatedGame = await gameRepository.update(game);

    const cacheKeyWithTableId = generateCacheKey(game.tableId);
    await set(cacheKeyWithTableId, updatedGame);

    return updatedGame;
  } catch (err) {
    console.error('Failed to update game', err);
  }
}

async function del (game) {
  try {
    await gameRepository.del(game.id);

    const cacheKeyWithTableId = generateCacheKey(game.tableId);
    await delInCache(cacheKeyWithTableId);
  } catch (err) {
    console.error('Failed to remove game', err);
  }
}

function generateCacheKey (tableId) {
  const cacheKey = 'ongoingGame';
  return `${cacheKey}_${tableId}`;
}

const gameService = { create, get, update, del };
export default gameService;
