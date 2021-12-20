import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { POT_REQUEST_PLAYER_ANSWERS } from '../../constants/pot-request-player-answers.js';
import { POT_REQUEST_STATUS } from '../../constants/pot-request-status.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import potRequestService from '../../services/pot-request-service.js';
import chipsCommonHandler from '../commons/chips-common-handler.js';
import commonHandler from '../commons/common-handler.js';
import gameHandler from '../game-handler.js';

async function createPotRequest (gameId, playerId) {
  const ongoingPotRequest = await _getOngoingPotRequest(gameId);
  if (ongoingPotRequest) {
    throw new ClientFriendlyException(
      'There is already an ongoing pot request',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  const game = await commonHandler.getGame(gameId);

  // Assert is member of game
  commonHandler.getParticipantIndex(game.participants, playerId);

  const participantsAnswers = game
    .participants
    .filter(p => p.playerId !== playerId)
    .map(({ playerId }) => ({
      playerId,
      answer: POT_REQUEST_STATUS.AWAITING
    }));

  await potRequestService.createPotRequest(game.tableId, gameId, playerId, participantsAnswers);
}

async function updatePotRequest (potRequestId, tableId, playerId, answer) {
  const potRequest = await potRequestService.getRequest(potRequestId);
  const participantAnswerIndex = potRequest.participantAnswers.findIndex(pa => pa.playerId === playerId);
  if (participantAnswerIndex === -1) {
    throw new ClientFriendlyException(
      'Participant is not in this pot-request',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  const answeringParticipant = potRequest.participantAnswers[participantAnswerIndex];
  if (answeringParticipant.answer !== POT_REQUEST_PLAYER_ANSWERS.AWAITING) {
    throw new ClientFriendlyException(
      'Participant has already answered',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  const givenAnswer = POT_REQUEST_PLAYER_ANSWERS[answer];
  if (!givenAnswer) {
    throw new ClientFriendlyException(
      'Invalid answer was given',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  answeringParticipant.answer = givenAnswer;

  let game;
  if (givenAnswer === POT_REQUEST_PLAYER_ANSWERS.NO) {
    potRequest.status = POT_REQUEST_STATUS.REJECTED;
  } else {
    const allOk =
      potRequest.participantAnswers.every(pa => pa.answer === POT_REQUEST_PLAYER_ANSWERS.OK);

    if (allOk) {
      potRequest.status = POT_REQUEST_STATUS.APPROVED;
      game = await gameHandler.getOngoingGame(tableId);

      const payoutParticipantIndex =
        game.participants.findIndex(p => p.playerId === potRequest.playerId);
      const payoutParticipant = game.participants[payoutParticipantIndex];

      chipsCommonHandler.addChips(payoutParticipant.chips, game.pot);

      game.pot = [];
    }
  }

  await potRequestService.updateRequest(potRequest);
  if (game) {
    await commonHandler.updateGame(game);
    await gameHandler.nextRound(game.id, playerId);
  }
}

async function getOngoingPotRequest (gameId, playerId) {
  // Assert game exists
  const game = await commonHandler.getGame(gameId);

  // Assert is member of game
  commonHandler.getParticipantIndex(game.participants, playerId);

  const ongoingPotRequest = await _getOngoingPotRequest(gameId);

  return ongoingPotRequest;
}

async function _getOngoingPotRequest (gameId) {
  const requests = await potRequestService.findRequestsForGame(gameId);
  const awaitingRequests = (requests || [])
    .filter((request) => request.status === POT_REQUEST_STATUS.AWAITING);

  if (awaitingRequests.length === 0) {
    return;
  } else if (awaitingRequests.length === 1) {
    return awaitingRequests[0];
  }

  throw new ClientFriendlyException(
    'There are multiple awaiting pot-requests',
    API_STATUS_CODES.BAD_REQUEST
  );
}

const potRequestHandler = { createPotRequest, getOngoingPotRequest, updatePotRequest };
export default potRequestHandler;
