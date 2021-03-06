import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import buyInHandler from '../../handlers/api-handlers/buy-in-handler.js';

function register (app) {
  app.post(`/${API_PREFIX}/game/buy-in`, jwtAuth, async (req, res) => {
    const { playerId, tableId } = req.auth;
    const { chips } = req.body;

    if (!chips || chips.length === 0) {
      return res
        .status(API_STATUS_CODES.BAD_REQUEST)
        .send(createErrorPayload('No chips was provided'));
    }

    try {
      await buyInHandler.doBuyIn(tableId, playerId, chips);
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

const buyInApi = { register };
export default buyInApi;
