import { GAME_STATUSES } from '../../constants/game-statuses.js';
import commonHandler from '../commons/common-handler.js';

async function doCloseGame (gameId, playerId) {
  const game = await commonHandler.getGame(gameId);

  // Assert is member of game
  commonHandler.getParticipantIndex(game.participants, playerId);

  game.status = GAME_STATUSES.CLOSED;
  game.closedBy = playerId;

  await commonHandler.updateGame(game);
}

const closeGameHandler = { doCloseGame };
export default closeGameHandler;
