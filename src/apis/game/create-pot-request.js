import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import potRequestHandler from '../../handlers/pot-request-handler.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import API_STATUS_CODES from '../../constants/api-status-codes.js';

function register (app) {
  app.post(`/${API_PREFIX}/game/:gameId/pot-requests`, jwtAuth, async (req, res) => {
    const { gameId } = req.params;
    const { playerId } = req.auth;

    try {
      await potRequestHandler.createPotRequest(gameId, playerId);
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

const createPotRequestApi = { register };
export default createPotRequestApi;
