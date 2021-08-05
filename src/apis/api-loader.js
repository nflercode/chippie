import createGameApi from './game/create-game.js';
import raiseApi from './game/raise.js';
import getGameOngoing from './game/get-game-ongoing.js';
import closeGame from './game/close-game.js';
import getChips from './chips/get-chips.js';
import checkApi from './game/check.js';
import createPotRequestApi from './game/create-pot-request.js';
import updatePotRequestApi from './game/update-pot-request.js';
import getAwaitingPotRequestApi from './game/get-awaiting-pot-request.js';

function loadApis(app) {
  getChips.register(app);
  createGameApi.register(app);
  raiseApi.register(app);
  getGameOngoing.register(app);
  closeGame.register(app);
  checkApi.register(app);
  createPotRequestApi.register(app);
  updatePotRequestApi.register(app);
  getAwaitingPotRequestApi.register(app);
}

const apiLoader = { loadApis };
export default apiLoader;