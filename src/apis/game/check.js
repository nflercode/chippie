import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import gameService from '../../services/game-service.js';
import actionRepository from '../../repositories/action-repository.js';
import actionService from '../../services/action-service.js';

function register(app) {
  app.post(`/${API_PREFIX}/game/:gameId/check`, jwtAuth, async (req, res) => {
    const { gameId } = req.params;
    const { playerId } = req.auth;

    let game = await gameService.getGame(gameId);
    if (!game) {
      return res.status(400).send(createErrorPayload('No game was found'));
    }

    const currentParticipantIndex = game.participants.findIndex((p) => p.playerId === playerId);
    let participant = game.participants[currentParticipantIndex];
    const preStateParticipant = participant;
    if (!participant.isCurrentTurn) {
      return res.status(400).send(createErrorPayload('It is not your turn!'));
    }

    participant.isCurrentTurn = false;

    const nextParticipantIndex = currentParticipantIndex === (game.participants.length -1) ? 0 : currentParticipantIndex + 1;
    game.participants[nextParticipantIndex].isCurrentTurn = true;

    const action = await actionService.createAction(gameId, playerId, [], actionRepository.PLAYER_ACTIONS.CHECK);
    console.log('Action was created!');
    participant.lastActionId = action.id;

    game.participants[currentParticipantIndex] = {
      ...preStateParticipant,
      ...participant
    };

    await gameService.updateGame(game);
    console.log('Game was updated!');
    res.sendStatus(200);
  });
}

const checkApi = { register };
export default checkApi;