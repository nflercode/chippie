import API_STATUS_CODES from "../constants/api-status-codes.js";
import gameService from "../services/game-service.js";
import actionService from "../services/action-service.js";
import { ClientFriendlyException } from "../exceptions/ClientFriendlyException.js";

async function getGame(gameId) {
  const game = await gameService.getGame(gameId);
  if (!game) {
    console.error(`Game was not found with id ${gameId}`);
    throw new ClientFriendlyException(
      'Game was not found',
      API_STATUS_CODES.NOT_FOUND
    );
  }

  return game;
}

async function updateGame(game) {
  const updatedGame = await gameService.updateGame(game);
  if (!updatedGame) {
    console.error(`Failed to update game for game: ${gameId}`);
    throw new ClientFriendlyException(
      'Failed to update game',
      API_STATUS_CODES.INTERNAL_ERROR
    );
  }

  return updatedGame;
}

function getParticipantIndex(participants, playerId) {
  const participantIndex = participants.findIndex((p) => p.playerId === playerId);
  if (!participantIndex === -1) {
    console.error(`Participant was not found with playerId ${playerId}`);
    throw new ClientFriendlyException(
      'Participant was not found',
      API_STATUS_CODES.NOT_FOUND
    );
  }

  return participantIndex;
}

function switchParticipantTurn(participants, currentParticipantIndex) {
  const currentParticipant = participants[currentParticipantIndex];
  participants[currentParticipantIndex].isCurrentTurn = false;

  const nextParticipantIndex = _getNextAvailableParticipantIndex(participants, currentParticipant);
  if (nextParticipantIndex !== -1) {
    participants[nextParticipantIndex].isCurrentTurn = true;
  } else {
    console.log(`Could not find any available participant to go to`);
  }

  return participants;
}

function _getNextAvailableParticipantIndex(participants, currentParticipant) {
  let nextParticipant;
  let nextParticipantIndex;

  const availableTurnOrders = participants.map(p => p.turnOrder);
  const maxTurnOrder = Math.max(...availableTurnOrders);
  const minTurnOrder = Math.min(...availableTurnOrders);
  
  const turnOrderCounter = (() => {
    let _currentTurn = currentParticipant.turnOrder;

    const _getNext = () => {
      ++_currentTurn;
      if (_currentTurn > maxTurnOrder)
        _currentTurn = minTurnOrder;
      
      return _currentTurn;
    }

    return {
      next: () => _getNext()
    }
  })();

  do {
    let nextTurnOrder = turnOrderCounter.next();
    
    if (nextTurnOrder === currentParticipant.turnOrder) {
      nextParticipantIndex = -1;
      break;
    }

    nextParticipantIndex = participants.findIndex(p => p.turnOrder === nextTurnOrder);
    if (nextParticipantIndex === -1) {
      throw `Failed to find participantIndex with ${nextTurnOrder}`;
    }

    nextParticipant = participants[nextParticipantIndex];
  } while (!nextParticipant.isParticipating)

  return nextParticipantIndex;
}

function assertIsCurrentTurn(participant) {
  if (!participant.isCurrentTurn) {
    console.error(`Participant isCurrent turn is false, is not allowed to performa action.`);
    throw new ClientFriendlyException(
      'It is not this participant turn',
      API_STATUS_CODES.BAD_REQUEST
    );
  }
}

async function createAction(gameId, playerId, chips, action) {
  const newAction = await actionService.createAction(gameId, playerId, chips, action);
  if (!newAction) {
    console.error(`Failed to create action for game: ${gameId}`);
    throw ClientFriendlyException(
      'Failed to create action',
      API_STATUS_CODES.INTERNAL_ERROR
    );
  }
}

function addChips(chips, chipsToAdd) {
  let chipsAdded = chips;

  chipsToAdd.forEach(chipToAdd => {
    const chipIndex = chipsAdded.findIndex(c => c.chipId === chipToAdd.chipId);
    let chip = chipIndex === -1 ? { chipId: chipToAdd.chipId, amount: 0 } : chipsAdded[chipIndex];

    chip.amount = chip.amount + chipToAdd.amount;

    if (chipIndex === -1) {
      chipsAdded.push(chip)
    } else {
      chipsAdded[chipIndex] = chip;
    }
  });

  return chipsAdded;
}

const commonHandler = {
  getGame,
  updateGame,
  getParticipantIndex,
  assertIsCurrentTurn,
  switchParticipantTurn,
  createAction,
  addChips
};
export default commonHandler;