import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import potRequestRepository from '../../repositories/pot-request-repository.js';
import potRequestService from '../../services/pot-request-service.js';
import gameService from '../../services/game-service.js';

function register(app) {
  app.put(`/${API_PREFIX}/game/pot/request/:requestId`, jwtAuth, async (req, res) => {
    const { requestId } = req.params;
    const { answer } = req.body;
    const { tableId, playerId } = req.auth;

    if (answer !== "OK" && answer !== "NO")
      return res.status(400).send(createErrorPayload('Must be OK on NO'));

    // Find game to get participants
    const request = await potRequestService.getRequest(requestId);
    if (!request) {
      return res.status(404).send(createErrorPayload('No request was found'));
    }

    // All participants except the requesting particiants
    const answeringParticipantIndex = request.participantAnswers.findIndex(p => p.playerId === playerId);
    if (answeringParticipantIndex === -1)
      return res.status(400).send(createErrorPayload('This participant does not exist for this request'));

    if (request.participantAnswers[answeringParticipantIndex].answer !== 'AWAITING')
      return res.status(400).send(createErrorPayload('Answer already given'));
    
    const givenAnswer = potRequestRepository.POT_REQUEST_PLAYER_ANSWERS[answer];
    request.participantAnswers[answeringParticipantIndex].answer = givenAnswer;

    let game;
    if (givenAnswer === potRequestRepository.POT_REQUEST_PLAYER_ANSWERS.NO) {
      request.status = potRequestRepository.POT_REQUEST_STATUS.REJECTED;
    } else {
      const allOk = request.participantAnswers.every(pa => pa.answer === potRequestRepository.POT_REQUEST_PLAYER_ANSWERS.OK);
      if (allOk) {
        request.status = potRequestRepository.POT_REQUEST_STATUS.APPROVED;
        const games = await gameService.findOngoingGames(tableId);

        if (games.length === 0) {
          return res.status(400).send(createErrorPayload('No ongoing game was found'));
        }
        game = games[0];
        const payoutParticipantIndex = game.participants.findIndex(p => p.playerId === request.playerId);
        const payoutParticipant = game.participants[payoutParticipantIndex];

        game.participants[payoutParticipantIndex].chips = payoutParticipant.chips.map((participantChip) => {
          const chipFromPot = game.pot.find(chip => participantChip.chipId == chip.chipId);

          return {
            chipId: chipFromPot ? chipFromPot.chipId : participantChip.chipId,
            amount: chipFromPot ? (participantChip.amount + chipFromPot.amount) : participantChip.amount
          }
        });
        game.pot = [];
      }
    }
    
    await potRequestService.updateRequest(request);
    if (game)
      await gameService.updateGame(game);

    console.log('Pot request was updated!');

    res.sendStatus(200);
  });
}

const updatePotRequestApi = { register };
export default updatePotRequestApi;