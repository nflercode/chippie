import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import gameHandler from '../../handlers/game-handler.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import API_STATUS_CODES from '../../constants/api-status-codes.js';

function register (app) {
  app.get(`/${API_PREFIX}/game/ongoing`, jwtAuth, async (req, res) => {
    const { tableId, playerId } = req.auth;

    try {
      const ongoingGame = await gameHandler.getOngoingGame(tableId, playerId);
      res.send({
        game: ongoingGame
      });
    } catch (err) {
      if (err instanceof ClientFriendlyException) {
        return res
          .status(err.statusCode)
          .send(createErrorPayload(err.message));
      }

      console.error(err);
      res.status(API_STATUS_CODES.INTERNAL_ERROR).send('Unexpected error occured');
    }
  });
}

const createGameApi = { register };
export default createGameApi;
