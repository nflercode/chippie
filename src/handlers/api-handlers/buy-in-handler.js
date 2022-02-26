import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { PLAYER_ACTIONS } from '../../constants/player-actions.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import actionsCommonHandler from '../commons/actions-common-handler.js';
import commonHandler from '../commons/common-handler.js';
import chipsCommonHandler from '../commons/chips-common-handler.js';
import actionService from '../../services/action-service.js';
import gameHandler from '../game-handler.js';
import { PARTICIPANT_SEATS } from '../../constants/participant-seats.js';
import { PARTICIPATION_STATUSES } from '../../constants/participation-statuses.js';

async function doBuyIn (tableId, playerId, bettingChips) {
  const game = await gameHandler.getOngoingGame(tableId);
  const [participant] = commonHandler.getParticipant(game.participants, playerId);

  commonHandler.assertIsCurrentTurn(participant);

  const { mapWithValue, getTotalValue } = chipsCommonHandler;
  const [bettingValue, gameActions] = await Promise.all([
    mapWithValue(bettingChips).then(getTotalValue),
    actionService.findForGameRound(game.id, game.round)
  ]);

  const notEnoughToBuyInText = 'Participant did not bet enough to buy in';
  const { SMALL_BLIND, BIG_BLIND } = PARTICIPANT_SEATS;
  switch (gameActions.length) {
    case 0:
      if (participant.seat === SMALL_BLIND && bettingValue !== game.smallBuyIn) {
        throw new ClientFriendlyException(
          notEnoughToBuyInText,
          API_STATUS_CODES.BAD_REQUEST
        );
      }
      break;

    case 1:
      if (participant.seat === BIG_BLIND && bettingValue !== game.bigBuyIn) {
        throw new ClientFriendlyException(
          notEnoughToBuyInText,
          API_STATUS_CODES.BAD_REQUEST
        );
      }
      break;

    default:
      throw new ClientFriendlyException(
        'Participant cant buy in',
        API_STATUS_CODES.BAD_REQUEST);
  }

  gameHandler.bet(game, participant, bettingChips);

  if (participant.chips.every(chip => chip.amount === 0)) {
    participant.participationStatus = PARTICIPATION_STATUSES.NO_CHIPS;
  }

  commonHandler.switchParticipantTurn(game.participants, participant);

  const newAction = {
    gameId: game.id,
    playerId,
    actionType: PLAYER_ACTIONS.BUY_IN,
    gameRound: game.round,
    chips: bettingChips,
    bettedValue: bettingValue,
    totalBettedValue: bettingValue
  };

  await commonHandler.updateGame(game);
  await actionsCommonHandler.createAction(newAction);
}

const buyInHandler = { doBuyIn };
export default buyInHandler;
