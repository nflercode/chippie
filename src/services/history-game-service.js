import { get, set } from '../cache/client';
import historyGameRepository from '../repositories/game-history';

const cacheKey = 'historyGame';

async function create (game) {
  try {
    const storedHistoryGame = await historyGameRepository.create(game);

    const cacheKeyWithTableId = generateCacheKey(storedHistoryGame.tableId);
    const cachedHistoryGames = await get(cacheKeyWithTableId) || [];
    await set(cacheKeyWithTableId, [...cachedHistoryGames, storedHistoryGame]);

    return storedHistoryGame;
  } catch (err) {
    console.error('Failed to create historyGame', err);
  }
}

function generateCacheKey (tableId) {
  return `${cacheKey}_${tableId}`;
}

const historyGameService = { create };
export default historyGameService;
