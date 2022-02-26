import { getOrSet } from '../cache/client.js';
import playerRepository from '../repositories/player-repository.js';

async function findPlayers (tableId) {
  try {
    const cacheKey = generateCacheKey(tableId);
    return await getOrSet(cacheKey, () => playerRepository.find(tableId));
  } catch (err) {
    console.error('Failed to find players!', err);
  }
}

function generateCacheKey (tableId) {
  const cacheKey = 'players';
  return `${cacheKey}_${tableId}`;
}

const playerService = { findPlayers };
export default playerService;
