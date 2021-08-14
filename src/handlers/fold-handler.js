import { PLAYER_ACTIONS } from '../constants/player-actions.js';
import commonHandler from './common-handler.js';

async function doFold(playerId, gameId) {
  console.log(`Performing fold for player ${playerId}`);

  let game = await commonHandler.getGame(gameId);

  const participantIndex =
    commonHandler.getParticipantIndex(game.participants, playerId);

  const participant = game.participants[participantIndex];
  commonHandler.assertIsCurrentTurn(participant);
   
  game.participants[participantIndex].isParticipating = false;

  const participantsWithSwitchedTurns =
    commonHandler.switchParticipantTurn(game.participants, participantIndex);

  game.participants = participantsWithSwitchedTurns;

  await commonHandler.updateGame(game);
  console.log(`Successfully updated game ${gameId}`);

  await commonHandler.createAction(gameId, playerId, [], PLAYER_ACTIONS.FOLD);
  console.log(`Successfully created action, type: "${PLAYER_ACTIONS.FOLD}" for player: ${playerId}`);
}

const foldHandler = { doFold };
export default foldHandler;