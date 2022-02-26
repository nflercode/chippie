import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { POT_REQUEST_PLAYER_ANSWERS } from '../../constants/pot-request-player-answers.js';
import { POT_REQUEST_STATUS } from '../../constants/pot-request-status.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import potRequestService from '../../services/pot-request-service.js';
import chipsCommonHandler from '../commons/chips-common-handler.js';
import commonHandler from '../commons/common-handler.js';
import gameHandler from '../game-handler.js';

async function createPotRequest (tableId, playerId) {
  const game = await commonHandler.getOngoingGame(tableId);

  // Assert is member of game
  commonHandler.getParticipant(game.participants, playerId);

  const ongoingPotRequest = await potRequestService.get(game.id);
  if (ongoingPotRequest) {
    throw new ClientFriendlyException(
      'There is already an ongoing pot request',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  const participantsAnswers = game
    .participants
    .filter(p => p.playerId !== playerId)
    .map(({ playerId }) => ({
      playerId,
      answer: POT_REQUEST_STATUS.AWAITING
    }));

  await potRequestService.create(tableId, game.id, playerId, participantsAnswers);
}

async function updatePotRequest (tableId, playerId, answer) {
  const game = await commonHandler.getOngoingGame(tableId);
  const potRequest = await potRequestService.get(game.id);

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

  if (givenAnswer === POT_REQUEST_PLAYER_ANSWERS.NO) {
    potRequest.status = POT_REQUEST_STATUS.REJECTED;

    await potRequestService.update(potRequest);
  } else {
    const allOk =
      potRequest.participantAnswers.every(pa => pa.answer === POT_REQUEST_PLAYER_ANSWERS.OK);

    if (allOk) {
      potRequest.status = POT_REQUEST_STATUS.APPROVED;

      const payoutParticipantIndex =
        game.participants.findIndex(p => p.playerId === potRequest.playerId);
      const payoutParticipant = game.participants[payoutParticipantIndex];

      chipsCommonHandler.addChips(payoutParticipant.chips, game.pot);

      game.pot = [];
    }

    await potRequestService.update(potRequest);
    await commonHandler.updateGame(game);
    await gameHandler.nextRound(game.id, playerId);
  }
}

async function getOngoingPotRequest (tableId, playerId) {
  // Assert game exists
  const game = await commonHandler.getOngoingGame(tableId);

  // Assert is member of game
  commonHandler.getParticipant(game.participants, playerId);

  return await potRequestService.get(game.id);
}

const potRequestHandler = { createPotRequest, getOngoingPotRequest, updatePotRequest };
export default potRequestHandler;
