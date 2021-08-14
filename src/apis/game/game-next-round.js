import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import gameHandler from '../../handlers/game-handler.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import API_STATUS_CODES from '../../constants/api-status-codes.js';

function register(app) {
  app.post(`/${API_PREFIX}/game/:gameId/round/next`, jwtAuth, async (req, res) => {
    const { tableId, playerId } = req.auth;
    const { gameId } = req.params;

    try {
      await gameHandler.nextRound(gameId, playerId);
    } catch (err) {
      if (err instanceof ClientFriendlyException) {
        return res
          .status(err.statusCode)
          .send(createErrorPayload(err.message));
      }

      console.error(err);
      return res.status(API_STATUS_CODES.INTERNAL_ERROR).send('Unexpected error occured');
    }

    res.sendStatus(200);
  });
}

const gameNextRoundApi = { register };
export default gameNextRoundApi;