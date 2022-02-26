import API_STATUS_CODES from '../../constants/api-status-codes.js';
import gameService from '../../services/game-service.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import { PARTICIPATION_STATUSES } from '../../constants/participation-statuses.js';

async function getOngoingGame (tableId) {
  const game = await gameService.get(tableId);
  if (!game) {
    console.error(`Game was not found with id ${tableId}`);
    throw new ClientFriendlyException(
      'Game was not found',
      API_STATUS_CODES.NOT_FOUND
    );
  }

  return game;
}

async function updateGame (game) {
  const updatedGame = await gameService.update(game);
  if (!updatedGame) {
    console.error(`Failed to update game for game: ${game.id}`);
    throw new ClientFriendlyException(
      'Failed to update game',
      API_STATUS_CODES.INTERNAL_ERROR
    );
  }

  return updatedGame;
}

function getParticipant (participants, playerId) {
  const index = participants.findIndex((p) => p.playerId === playerId);
  if (!index === -1) {
    console.error(`Participant was not found with playerId ${playerId}`);
    throw new ClientFriendlyException(
      'Participant was not found',
      API_STATUS_CODES.NOT_FOUND
    );
  }

  const participant = participants[index];
  return [participant, index];
}

function switchParticipantTurn (participants, participant) {
  participant.isCurrentTurn = false;

  const nextParticipantIndex = _getNextAvailableParticipantIndex(participants, participant);
  if (nextParticipantIndex !== -1) {
    participants[nextParticipantIndex].isCurrentTurn = true;
  } else {
    console.log('Could not find any available participant to go to');
  }

  return participants;
}

function _getNextAvailableParticipantIndex (participants, currentParticipant) {
  let nextParticipant;
  let nextParticipantIndex;

  const availableTurnOrders = participants
    .filter(p => p.participationStatus === PARTICIPATION_STATUSES.PARTICIPATING)
    .map(p => p.turnOrder);
  const maxTurnOrder = Math.max(...availableTurnOrders);
  const minTurnOrder = Math.min(...availableTurnOrders);

  const turnOrderCounter = (() => {
    let _currentTurn = currentParticipant.turnOrder;

    const _getNext = () => {
      ++_currentTurn;
      if (_currentTurn > maxTurnOrder) { _currentTurn = minTurnOrder; }

      return _currentTurn;
    };

    return {
      next: () => _getNext()
    };
  })();

  do {
    const nextTurnOrder = turnOrderCounter.next();

    if (nextTurnOrder === currentParticipant.turnOrder) {
      nextParticipantIndex = -1;
      break;
    }

    nextParticipantIndex = participants.findIndex(p => p.turnOrder === nextTurnOrder);
    if (nextParticipantIndex === -1) {
      throw new Error(`Failed to find participantIndex with ${nextTurnOrder}`);
    }

    nextParticipant = participants[nextParticipantIndex];
  } while (nextParticipant.participationStatus !== PARTICIPATION_STATUSES.PARTICIPATING);

  return nextParticipantIndex;
}

function assertIsCurrentTurn (participant) {
  if (!participant.isCurrentTurn) {
    console.error('Participant isCurrent turn is false, is not allowed to performa action.');
    throw new ClientFriendlyException(
      'It is not this participant turn',
      API_STATUS_CODES.BAD_REQUEST
    );
  }
}

const commonHandler = {
  getOngoingGame,
  updateGame,
  getParticipant,
  assertIsCurrentTurn,
  switchParticipantTurn
};
export default commonHandler;
