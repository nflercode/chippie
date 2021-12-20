import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import raiseHandler from '../../handlers/api-handlers/raise-handler.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import API_STATUS_CODES from '../../constants/api-status-codes.js';

function register (app) {
  app.post(`/${API_PREFIX}/game/:gameId/raise`, jwtAuth, async (req, res) => {
    const { gameId } = req.params;
    const { playerId } = req.auth;
    const { chips } = req.body;

    if (!chips || chips.length === 0) {
      return res
        .status(API_STATUS_CODES.BAD_REQUEST)
        .send(createErrorPayload('No chips was provided'));
    }

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
