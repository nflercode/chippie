import { jwtAuth } from '../middlewares/jwtAuthentication.js';
import { API_PREFIX, createErrorPayload } from '../common/common-payloads.js';
import gameService from '../../services/game-service.js';
import actionService from '../../services/action-service.js';
import actionRepository from '../../repositories/action-repository.js';

function register(app) {
  app.post(`/${API_PREFIX}/game/raise`, jwtAuth, async (req, res) => {
    const { playerId } = req.auth;
    const { gameId, chips: bettingChips } = req.body;

    const game = await gameService.getGame(gameId);
    if (!game) {
      return res.status(400).send(createErrorPayload('No game exists'));
    }

    const currentParticipantIndex = game.participants.findIndex((p) => p.playerId === playerId);
    let participant = game.participants[currentParticipantIndex];
    const preStateParticipant = participant;
    if (!participant.isCurrentTurn) {
      return res.status(400).send(createErrorPayload('It is not your turn!'));
    }

    participant.chips = participant.chips.map((chipInHand) => {
      const bettingChip = bettingChips.find((chip) => chip.chipId === chipInHand.chipId);
      return {
        ...chipInHand,
        amount: bettingChip ? (chipInHand.amount - bettingChip.amount) : chipInHand.amount 
      }
    });

    const notEnoughInHandOfChip = participant.chips.filter(chipInHand => chipInHand.amount < 0);
    if (notEnoughInHandOfChip.length > 0) {
      return res.status(400).send(createErrorPayload("Not enough chips!"));
    }

    const chipsToAdd = bettingChips.map((bettingChip) => {
      const chipInPot = game.pot.find((cip) => cip.chipId === bettingChip.chipId);
      return {
        chipId: bettingChip.chipId,
        amount: chipInPot ? (chipInPot.amount + bettingChip.amount) : bettingChip.amount 
      }
    });

    game.pot = [
      ...game.pot.filter(chip => chipsToAdd.findIndex(chipToAdd => chipToAdd.chipId == chip.chipId) === -1),
      ...chipsToAdd
    ];

    participant.isCurrentTurn = false;

    const nextParticipantIndex = currentParticipantIndex === (game.participants.length -1) ? 0 : currentParticipantIndex + 1;
    game.participants[nextParticipantIndex].isCurrentTurn = true;

    const action = await actionService.createAction(gameId, playerId, bettingChips, actionRepository.PLAYER_ACTIONS.RAISE);
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

const raiseApi = { register };
export default raiseApi;