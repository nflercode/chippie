import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import raiseHandler from '../../handlers/raise-handler.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import API_STATUS_CODES from '../../constants/api-status-codes.js';

function register(app) {
  app.post(`/${API_PREFIX}/game/raise`, jwtAuth, async (req, res) => {
    const { playerId } = req.auth;
    const { gameId, chips } = req.body;

    try {
      await raiseHandler.doRaise(gameId, playerId, chips);
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

const raiseApi = { register };
export default raiseApi;