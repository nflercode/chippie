import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import potRequestHandler from '../../handlers/pot-request-handler.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { POT_REQUEST_PLAYER_ANSWERS } from '../../constants/pot-request-player-answers.js';

function register(app) {
  app.put(`/${API_PREFIX}/game/pot/request/:requestId`, jwtAuth, async (req, res) => {
    const { requestId } = req.params;
    const { answer } = req.body;
    const { tableId, playerId } = req.auth;

    if (answer !== POT_REQUEST_PLAYER_ANSWERS.OK && answer !== POT_REQUEST_PLAYER_ANSWERS.NO)
      return res.status(400).send(createErrorPayload('Must be OK on NO'));

    try {
      await potRequestHandler.updatePotRequest(requestId, tableId, playerId, answer);
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

const updatePotRequestApi = { register };
export default updatePotRequestApi;