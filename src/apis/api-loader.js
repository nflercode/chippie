import createGameApi from './game/create-game.js';
import raiseApi from './game/raise.js';
import getGameOngoing from './game/get-game-ongoing.js';
import getChips from './chips/get-chips.js';
import checkApi from './game/check.js';
import createPotRequestApi from './game/create-pot-request.js';
import updatePotRequestApi from './game/update-pot-request.js';
import getAwaitingPotRequestApi from './game/get-ongoing-pot-request.js';
import foldApi from './game/fold.js';
import closeGameApi from './game/close-game.js';
import gameNextRoundApi from './game/game-next-round.js';
import callApi from './game/call.js';
import gameRoundActionsApi from './game/game-round-actions.js';
import exchangeChipsApi from './chips/exchange-chips.js';

function loadApis (app) {
  getChips.register(app);
  createGameApi.register(app);
  raiseApi.register(app);
  getGameOngoing.register(app);
  checkApi.register(app);
  createPotRequestApi.register(app);
  updatePotRequestApi.register(app);
  getAwaitingPotRequestApi.register(app);
  foldApi.register(app);
  closeGameApi.register(app);
  gameNextRoundApi.register(app);
  callApi.register(app);
  gameRoundActionsApi.register(app);
  exchangeChipsApi.register(app);
}

const apiLoader = { loadApis };
export default apiLoader;
