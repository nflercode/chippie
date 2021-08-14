import gameRepository from '../repositories/game-repository.js';

async function createGame(tableId, participants, createdByPlayerId) {
  try {
    const createdGame = await gameRepository.createGame(tableId, participants, createdByPlayerId);
    return createdGame;
  } catch (err) {
    console.error('Failed to create game.', err);
  }
}

async function getGame(gameId) {
  try {
    return await gameRepository.getGame(gameId);
  } catch (err) {
    console.error('Failed to get game', gameId);
  }
}

async function findGamesForTable(tableId) {
  try {
    return await gameRepository.getByTableId(tableId);
  } catch (err) {
    console.error('Failed to get game', gameId);
  }
}

async function updateGame(game) {
  try {
    return await gameRepository.updateGame(game);
  } catch (err) {
    console.error('Failed to update game', err);
  }
}

const gameService = { createGame, getGame, updateGame , findGamesForTable}
export default gameService;