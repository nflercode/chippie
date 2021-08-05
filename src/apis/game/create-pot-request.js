import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import gameService from '../../services/game-service.js';
import potRequestRepository from '../../repositories/pot-request-repository.js';
import potRequestService from '../../services/pot-request-service.js';

function register(app) {
  app.post(`/${API_PREFIX}/game/:gameId/pot/request`, jwtAuth, async (req, res) => {
    const { gameId } = req.params;
    const { tableId, playerId } = req.auth;

    // Find game to get participants
    const game = await gameService.getGame(gameId);
    if (!game) {
      return res.status(400).send(createErrorPayload('No game was found'));
    }

    // All participants except the requesting particiants
    const participantsAnswers = game
      .participants
        .filter(p => p.playerId !== playerId)
        .map(p => ({
          playerId: p.playerId,
          answer: potRequestRepository.POT_REQUEST_PLAYER_ANSWERS.AWAITING
        }));

    
    await potRequestService.createPotRequest(tableId, gameId, playerId, participantsAnswers);
    console.log('Pot request was created!');

    res.sendStatus(200);
  });
}

const createPotRequestApi = { register };
export default createPotRequestApi;