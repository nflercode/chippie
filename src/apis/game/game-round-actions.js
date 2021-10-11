import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import actionsCommonHandler from '../../handlers/commons/actions-common-handler.js';

function register (app) {
  app.get(`/${API_PREFIX}/game/:gameId/actions/:round`, jwtAuth, async (req, res) => {
    const { gameId, round } = req.params;

    try {
      const actions = await actionsCommonHandler.findGameActionsForRound(gameId, +round);
      res.send({ actions });
    } catch (err) {
      if (err instanceof ClientFriendlyException) {
        return res
          .status(err.statusCode)
          .send(createErrorPayload(err.message));
      }

      console.error(err);
      return res.status(API_STATUS_CODES.INTERNAL_ERROR).send('Unexpected error occured');
    }
  });
}

const gameRoundActionsApi = { register };
export default gameRoundActionsApi;
