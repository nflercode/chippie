import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { PLAYER_ACTIONS } from '../../constants/player-actions.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import actionsCommonHandler from '../commons/actions-common-handler.js';
import commonHandler from '../commons/common-handler.js';
import chipsCommonHandler from '../commons/chips-common-handler.js';
import actionService from '../../services/action-service.js';
import gameHandler from '../game-handler.js';
import { PARTICIPANT_SEATS } from '../../constants/participant-seats.js';
import chipService from '../../services/chip-service.js';
import { PARTICIPATION_STATUSES } from '../../constants/participation-statuses.js';

async function doBuyIn (tableId, playerId, bettingChips) {
  const game = await gameHandler.getOngoingGame(tableId);

  const participantIndex = commonHandler.getParticipantIndex(game.participants, playerId);
  const participant = game.participants[participantIndex];

  commonHandler.assertIsCurrentTurn(participant);

  const actualChips = await chipService.getAllChips();
  const bettingChipsWithValue = chipsCommonHandler.mapBettingChipWithValue(bettingChips, actualChips);
  const bettingValue = chipsCommonHandler.getBettedValueFromChips(bettingChipsWithValue);

  const gameActions = await actionService.findActionsForGame(game.id, game.round);

  if (gameActions.length === 0 && participant.seat === PARTICIPANT_SEATS.SMALL_BLIND) {
    if (bettingValue !== game.smallBuyIn) {
      throw new ClientFriendlyException(
        'Participant did not bet enough to buy in',
        API_STATUS_CODES.BAD_REQUEST);
    }
  } else if (gameActions.length === 1 && participant.seat === PARTICIPANT_SEATS.BIG_BLIND) {
    if (bettingValue !== game.bigBuyIn) {
      throw new ClientFriendlyException(
        'Participant did not bet enough to buy in',
        API_STATUS_CODES.BAD_REQUEST);
    }
  } else {
    throw new ClientFriendlyException(
      'Participant cant buy in',
      API_STATUS_CODES.BAD_REQUEST);
  }

  chipsCommonHandler.subtractChips(participant.chips, bettingChips);
  chipsCommonHandler.addChips(game.pot, bettingChips);

  if (participant.chips.every(chip => chip.amount === 0)) {
    participant.participationStatus = PARTICIPATION_STATUSES.NO_CHIPS;
  }

  commonHandler.switchParticipantTurn(game.participants, participantIndex);

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
