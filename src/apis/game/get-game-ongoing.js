import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import gameService from '../../services/game-service.js';

function register(app) {
  app.get(`/${API_PREFIX}/game/ongoing`, jwtAuth, async (req, res) => {
    const { playerId, tableId } = req.auth;

    const ongoingGames = await gameService.findOngoingGames(tableId);
    if (ongoingGames.length === 0) {
      return res.status(404).send(createErrorPayload('Could not any ongoing games'));
    }

    const ongoingGame = ongoingGames[0];
    const isMember = ongoingGame.participants.find((p) => p.playerId === playerId);
    if (!isMember) {
      return res.status(400).send(createErrorPayload('You are not allowed to view this game.'));
    }

    res.send({
      game: ongoingGame
    });
  });
}

const createGameApi = { register };
export default createGameApi;