import chipRepository from '../repositories/chip-repository.js';
import gameRepository from '../repositories/game-repository.js';
import chipService from './chip-service.js';

const { CHIP_TYPES } = chipRepository;
const defaultChipDistribution = {
  [CHIP_TYPES.WHITE]: {
    amount: 10
  },
  [CHIP_TYPES.RED]: {
    amount: 10
  },
  [CHIP_TYPES.BLUE]: {
    amount: 9
  },
  [CHIP_TYPES.GREEN]: {
    amount: 2
  }
}

async function getStartingChips() {
  const allChips = await chipService.getAllChips();

  const distributionConfigMerged = allChips.map((chip) => {
    const currentConfig = defaultChipDistribution[chip.type];
    if (currentConfig) {
      return {
        chipId: chip.id,
        amount: currentConfig.amount
      }
    }
  }).filter(Boolean);

  return distributionConfigMerged;
}

async function createGame(tableId, participants) {
  try {
    const createdGame = await gameRepository.createGame(tableId, participants);
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

async function findOngoingGames(tableId) {
  try {
    const gamesForTable = await gameRepository.getByTableId(tableId);
    return gamesForTable.filter(
      (game) =>
        game.status === gameRepository.GAME_STATUSES.ONGOING);
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

const gameService = { createGame, getGame, updateGame, getStartingChips , findOngoingGames}
export default gameService;