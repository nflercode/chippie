import API_STATUS_CODES from "../constants/api-status-codes.js";
import { GAME_STATUSES } from "../constants/game-statuses.js";
import { ClientFriendlyException } from "../exceptions/ClientFriendlyException.js";
import gameService from "../services/game-service.js";
import playerService from "../services/player-service.js";
import chipService from "../services/chip-service.js";
import { DEFAULT_DISTRIBUTION } from "./chip-distribution-configs.js";
import commonHandler from "./common-handler.js";

async function createGame(tableId, playerId) {
  const ongoingGame = await _getOngoingGame(tableId);
  if (ongoingGame) {
    throw new ClientFriendlyException(
      'Game already has an ongoing game',
      API_STATUS_CODES.BAD_REQUEST
    )
  }
  
  const players = await playerService.findPlayers(tableId);
  if (!players || players.length < 1) {
    throw new ClientFriendlyException(
      'There are no players',
      API_STATUS_CODES.BAD_REQUEST
    )
  }

  const startingChips = await getStartingChips();
  const participants = createParticipants(players, startingChips);

  await gameService.createGame(tableId, participants, playerId);
}

async function closeGame(gameId, playerId) {
  const game = await commonHandler.getGame(gameId);

  // Assert is member of game
  commonHandler.getParticipantIndex(game.participants, playerId);

  game.status = GAME_STATUSES.CLOSED;
  game.closedBy = playerId;

  await commonHandler.updateGame(game);
}

async function getOngoingGame(tableId, playerId) {
  const ongoingGame = await _getOngoingGame(tableId);
  if (!ongoingGame) {
    throw new ClientFriendlyException(
      'No ongoing game was found',
      API_STATUS_CODES.NOT_FOUND
    );
  }

  // Assert is member of game
  commonHandler.getParticipantIndex(ongoingGame.participants, playerId);

  return ongoingGame;
}

async function nextRound(gameId, playerId) {
  let game = await commonHandler.getGame(gameId);

  commonHandler.getParticipantIndex(game.participants, playerId);

  game.round = ++game.round;

  const availableTurnOrders = game.participants.map(p => p.turnOrder);
  const maxTurnOrder = Math.max(...availableTurnOrders);
  const minTurnOrder = Math.min(...availableTurnOrders);

  game.participants = game.participants.map((p) => {
    let nextTurnOrder = --p.turnOrder;
    if (nextTurnOrder < minTurnOrder) {
      nextTurnOrder = maxTurnOrder;
    }

    return {
      ...p,
      isParticipating: true,
      isCurrentTurn: nextTurnOrder === minTurnOrder,
      turnOrder: nextTurnOrder
    }
  });

  await commonHandler.updateGame(game);
}

async function _getOngoingGame(tableId) {
  const games = await gameService.findGamesForTable(tableId);
  if (!games) {
    return;
  }

  const ongoingGames = games.filter((game) => game.status === GAME_STATUSES.ONGOING);
  if (ongoingGames.length === 0) {
    return;
  } else if (ongoingGames.length === 1) {
    return ongoingGames[0];
  }

  throw new ClientFriendlyException(
    'There are multiple ongoing games',
    API_STATUS_CODES.BAD_REQUEST
  );
}

async function getStartingChips() {
  const allChips = await chipService.getAllChips();
  if (!allChips || allChips.length === 0) {
    throw new ClientFriendlyException(
      'Failed to get chips',
      API_STATUS_CODES.INTERNAL_ERROR
    )
  }

  const distributionConfigMerged = allChips.map((chip) => {
    const currentConfig = DEFAULT_DISTRIBUTION[chip.type];
    if (currentConfig) {
      return {
        chipId: chip.id,
        amount: currentConfig.amount
      }
    }
  }).filter(Boolean);

  return distributionConfigMerged;
}

function createParticipants(players, startingChips) {
  const playerIds = players.map((p) => p.id);
  const participants = 
    playerIds
      .sort(() => Math.random() - 0.5)
      .map((playerId, i) => ({
        playerId,
        turnOrder: ++i,
        isCurrentTurn: i === 1,
        isParticipating: true,
        chips: startingChips
      }));
  
  return participants;
}

const gameHandler = {
  createGame,
  getOngoingGame,
  closeGame,
  nextRound
};
export default gameHandler;