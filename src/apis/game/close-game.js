import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import gameService from '../../services/game-service.js';
import gameRepository from '../../repositories/game-repository.js';

function register(app) {
  app.put(`/${API_PREFIX}/game/:gameId/close`, jwtAuth, async (req, res) => {
    const { gameId } = req.params;
    const { playerId } = req.auth;

    let game = await gameService.getGame(gameId);
    if (!game) {
      return res.status(400).send(createErrorPayload('No game was found'));
    }

    const isMember = gameService.participants.find((p) => p.playerId === playerId);
    if (!isMember) {
      return res.status(400).send(createErrorPayload('You are not allowed to close this game.'));
    }

    game.status = gameRepository.GAME_STATUSES.ENDED;
    await gameService.updateGame(game);

    res.sendStatus(200);
  });
}

const createGameApi = { register };
export default createGameApi;