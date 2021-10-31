import API_STATUS_CODES from '../constants/api-status-codes.js';
import { GAME_STATUSES } from '../constants/game-statuses.js';
import { ClientFriendlyException } from '../exceptions/ClientFriendlyException.js';
import gameService from '../services/game-service.js';
import playerService from '../services/player-service.js';
import chipService from '../services/chip-service.js';
import { DEFAULT_DISTRIBUTION } from './chip-distribution-configs.js';
import commonHandler from './commons/common-handler.js';
import { PARTICIPATION_STATUSES } from '../constants/participation-statuses.js';

async function createGame (tableId, playerId) {
  const ongoingGame = await _getOngoingGame(tableId);
  if (ongoingGame) {
    throw new ClientFriendlyException(
      'Game already has an ongoing game',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  const players = await playerService.findPlayers(tableId);
  if (!players || players.length < 1) {
    throw new ClientFriendlyException(
      'There are no players',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  const startingChips = await _getStartingChips();
  const participants = _createParticipants(players, startingChips);

  await gameService.createGame(tableId, participants, playerId);
}

async function closeGame (gameId, playerId) {
  const game = await commonHandler.getGame(gameId);

  // Assert is member of game
  commonHandler.getParticipantIndex(game.participants, playerId);

  game.status = GAME_STATUSES.CLOSED;
  game.closedBy = playerId;

  await commonHandler.updateGame(game);
}

async function getOngoingGame (tableId, playerId) {
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

async function nextRound (gameId, playerId) {
  console.log('Going to next round for game ', gameId);
  const game = await commonHandler.getGame(gameId);

  commonHandler.getParticipantIndex(game.participants, playerId);

  game.round++;

  game.participants = game.participants.map((p) => {
    let newParticipationStatus = p.participationStatus;
    if (p.participationStatus === PARTICIPATION_STATUSES.FOLDED) {
      newParticipationStatus = PARTICIPATION_STATUSES.PARTICIPATING;
    }

    if (p.participationStatus === PARTICIPATION_STATUSES.NO_CHIPS) {
      const isOutOfChips = p.chips.every(chip => chip.amount === 0);
      if (!isOutOfChips) {
        newParticipationStatus = PARTICIPATION_STATUSES.PARTICIPATING;
      } else {
        const numCurrentPlacings = game.participants.filter(({ placing }) => !!placing).length;
        const nextPlacing = game.participants.length - numCurrentPlacings;
        p.placing = nextPlacing;
      }
    }

    return {
      ...p,
      participationStatus: newParticipationStatus,
      isCurrentTurn: false,
      turnOrder:
        newParticipationStatus !== PARTICIPATION_STATUSES.PARTICIPATING
          ? undefined
          : p.turnOrder
    };
  });

  const activeParticipants =
    game.participants.filter(
      p => p.participationStatus === PARTICIPATION_STATUSES.PARTICIPATING
    );

  if (activeParticipants.length === 1) {
    activeParticipants[0].placing = 1;
    game.status = GAME_STATUSES.ENDED;
  } else {
    const minTurnOrder = 1;
    let turnOrder = minTurnOrder;

    activeParticipants
      .sort((a, b) => a.turnOrder - b.turnOrder)
      .unshift(activeParticipants.pop());

    activeParticipants.forEach(p => {
      p.turnOrder = turnOrder;
      p.isCurrentTurn = turnOrder === minTurnOrder;

      turnOrder++;
    });
  }

  await commonHandler.updateGame(game);
}

async function _getOngoingGame (tableId) {
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

async function _getStartingChips () {
  const allChips = await chipService.getAllChips();
  if (!allChips || allChips.length === 0) {
    throw new ClientFriendlyException(
      'Failed to get chips',
      API_STATUS_CODES.INTERNAL_ERROR
    );
  }

  const distributionConfigMerged = allChips.map((chip) => {
    const currentConfig = DEFAULT_DISTRIBUTION[chip.type];
    if (currentConfig) {
      return {
        chipId: chip.id,
        amount: currentConfig.amount
      };
    }

    return undefined;
  }).filter(Boolean);

  return distributionConfigMerged;
}

function _createParticipants (players, startingChips) {
  const playerIds = players.map((p) => p.id);
  const participants =
    playerIds
      .sort(() => Math.random() - 0.5)
      .map((playerId, i) => ({
        playerId,
        turnOrder: ++i,
        isCurrentTurn: i === 1,
        participationStatus: PARTICIPATION_STATUSES.PARTICIPATING,
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
