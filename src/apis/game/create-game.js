import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import gameService from '../../services/game-service.js';
import playerService from '../../services/player-service.js';

function register(app) {
  app.post(`/${API_PREFIX}/game`, jwtAuth, async (req, res) => {
    const { tableId } = req.auth;

    const ongoingGames = await gameService.findOngoingGames(tableId);
    if (ongoingGames.length >= 1) {
      return res.status(400).send(createErrorPayload('Table already have an ongoing game'));
    }

    const players = await playerService.findPlayers(tableId);
    const playerIds = players.map((p) => p.id);
    
    // Create participants
    const startingChips = await gameService.getStartingChips();
    const participants = playerIds
                          .sort(() => Math.random() - 0.5)
                          .map((playerId, i) => ({
                            playerId,
                            turnOrder: ++i,
                            isCurrentTurn: i === 1,
                            chips: startingChips
                          }));

    console.log('Creating game with ', participants.length, 'participants');
    const game = await gameService.createGame(tableId, participants);
    console.log('Created game!', game.id);

    res.sendStatus(200);
  });
}

const createGameApi = { register };
export default createGameApi;