import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import potRequestService from '../../services/pot-request-service.js';

function register(app) {
  app.get(`/${API_PREFIX}/game/:gameId/pot/request`, jwtAuth, async (req, res) => {
    const { gameId } = req.params;
    // Find game to get participants
    const awaitingRequests = await potRequestService.findOngoingRequest(gameId);
    if (!awaitingRequests.length === 0) {
      return res.status(400).send(createErrorPayload('No request was found'));
    }

    const awaitingRequest = awaitingRequests[0];

    res.send({ potRequest: awaitingRequest });
  });
}

const getAwaitingPotRequestApi = { register };
export default getAwaitingPotRequestApi;