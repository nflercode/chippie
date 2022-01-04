import API_STATUS_CODES from '../constants/api-status-codes.js';
import { GAME_STATUSES } from '../constants/game-statuses.js';
import { ClientFriendlyException } from '../exceptions/ClientFriendlyException.js';
import gameService from '../services/game-service.js';
import chipService from '../services/chip-service.js';
import commonHandler from './commons/common-handler.js';
import { PARTICIPATION_STATUSES } from '../constants/participation-statuses.js';
import { PARTICIPANT_SEATS } from '../constants/participant-seats.js';
import chipsCommonHandler from './commons/chips-common-handler.js';
import { BUY_IN_PRICES } from '../constants/buy-in-prices.js';

async function nextRound (gameId, playerId) {
  console.log('Going to next round for game', gameId);
  const game = await commonHandler.getGame(gameId);

  commonHandler.getParticipantIndex(game.participants, playerId);

  game.round++;

  game.participants = await _mapNewParticipantsStatuses(game.participants);

  const activeParticipants =
    game.participants.filter(
      p => p.participationStatus === PARTICIPATION_STATUSES.PARTICIPATING
    );

  const numActiveParticipants = activeParticipants.length;
  let smallBuyInParticipant;
  if (numActiveParticipants === 1) {
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
      p.seat = getSeatByTurnOrder(turnOrder, numActiveParticipants);
      if (p.seat === PARTICIPANT_SEATS.SMALL_BLIND) {
        smallBuyInParticipant = p;
      }

      turnOrder++;
    });
  }

  activeParticipants
    .sort((a, b) => a.totalChipValue - b.totalChipValue);

  const lowestTotalChipValue = activeParticipants[0].totalChipValue;
  if (lowestTotalChipValue < game.bigBuyIn) {
    game.bigBuyIn = lowestTotalChipValue;
  } else {
    game.bigBuyIn = BUY_IN_PRICES.BIG_BUY_IN;
  }

  if (smallBuyInParticipant?.totalChipValue < game.smallBuyIn) {
    game.smallBuyIn = smallBuyInParticipant.totalChipValue;
  } else {
    game.smallBuyIn = BUY_IN_PRICES.SMALL_BUY_IN;
  }

  await commonHandler.updateGame(game);
}

async function getOngoingGame (tableId) {
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

async function _mapNewParticipantsStatuses (participants) {
  const actualChips = await chipService.getAllChips();

  return participants.map((participant) => {
    let newParticipationStatus, newPlacing;

    const totalChipValue = getTotalValueOfChips(participant.chips, actualChips);
    if (totalChipValue !== 0) {
      newParticipationStatus = PARTICIPATION_STATUSES.PARTICIPATING;
    } else {
      const numCurrentPlacings = participants.filter(({ placing }) => !!placing).length;
      newPlacing = participants.length - numCurrentPlacings;
      newParticipationStatus = PARTICIPATION_STATUSES.NO_CHIPS;
    }

    return {
      ...participant,
      participationStatus: newParticipationStatus,
      isCurrentTurn: false,
      seat: undefined,
      totalChipValue,
      placing: newPlacing,
      turnOrder:
        newParticipationStatus !== PARTICIPATION_STATUSES.PARTICIPATING
          ? undefined
          : participant.turnOrder
    };
  });
}

function getTotalValueOfChips (chips, actualChips) {
  const bettingChipsWithValue = chipsCommonHandler.mapBettingChipWithValue(chips, actualChips);
  return chipsCommonHandler.getBettedValueFromChips(bettingChipsWithValue);
}

function getSeatByTurnOrder (turnOrder, maxTurnOrder) {
  switch (turnOrder) {
    case 1:
      return PARTICIPANT_SEATS.SMALL_BLIND;
    case 2:
      return PARTICIPANT_SEATS.BIG_BLIND;
    case maxTurnOrder:
      return PARTICIPANT_SEATS.DEALER;
    default:
      return PARTICIPANT_SEATS.UNDEFINED;
  }
}

const gameHandler = {
  getOngoingGame,
  getSeatByTurnOrder,
  nextRound
};
export default gameHandler;
