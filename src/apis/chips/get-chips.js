import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX } from '../common/common-payloads.js';
import chipService from '../../services/chip-service.js';

function register (app) {
  app.get(`/${API_PREFIX}/chips`, jwtAuth, async (_, res) => {
    const chips = await chipService.getAllChips();
    res.send({ chips });
  });
}

const getChips = { register };
export default getChips;
