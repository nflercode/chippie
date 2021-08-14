import { PLAYER_ACTIONS } from '../constants/player-actions.js';
import commonHandler from './common-handler.js';

async function doCheck(playerId, gameId) {
  console.log(`Performing check for player ${playerId}`);

  let game = await commonHandler.getGame(gameId);
  const participantIndex = commonHandler.getParticipantIndex(game.participants, playerId);

  const participant = game.participants[participantIndex];
  commonHandler.assertIsCurrentTurn(participant);
  
  const participantsWithSwitchedTurns = 
    commonHandler.switchParticipantTurn(game.participants, participantIndex);

  game.participants = participantsWithSwitchedTurns;

  await commonHandler.updateGame(game);
  console.log(`Successfully updated game ${gameId}`);

  await commonHandler.createAction(gameId, playerId, [], PLAYER_ACTIONS.CHECK);
  
  console.log(`Successfully created action, type: "${PLAYER_ACTIONS.CHECK}" for player: ${playerId}`);
}

const checkHandler = { doCheck };
export default checkHandler;