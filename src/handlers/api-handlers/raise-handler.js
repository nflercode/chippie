import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { PLAYER_ACTIONS } from '../../constants/player-actions.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import chipService from '../../services/chip-service.js';
import actionsCommonHandler from '../commons/actions-common-handler.js';
import commonHandler from '../commons/common-handler.js';
import chipsCommonHandler from '../commons/chips-common-handler.js';
import rules from '../rules.js';
import { PARTICIPATION_STATUSES } from '../../constants/participation-statuses.js';

async function doRaise (gameId, playerId, bettingChips) {
  const game = await commonHandler.getGame(gameId);

  const participantIndex =
    commonHandler.getParticipantIndex(game.participants, playerId);

  const participant = game.participants[participantIndex];
  commonHandler.assertIsCurrentTurn(participant);

  const actualChips = await chipService.getAllChips();
  const gameActions = await actionsCommonHandler.findGameActionsForRound(gameId, game.round);

  const bettingChipsWithValue = chipsCommonHandler.mapBettingChipWithValue(bettingChips, actualChips);
  const bettedValue = chipsCommonHandler.getBettedValueFromChips(bettingChipsWithValue);

  const [canIRaise, newTotalBettedValue] = rules.canIRaise(gameActions, playerId, bettedValue);
  if (!canIRaise) {
    throw new ClientFriendlyException(
      'You can not raise',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  chipsCommonHandler.subtractChips(participant.chips, bettingChips);
  chipsCommonHandler.addChips(game.pot, bettingChips);

  if (participant.chips.every(chip => chip.amount === 0)) {
    participant.participationStatus = PARTICIPATION_STATUSES.NO_CHIPS;
  }

  commonHandler.switchParticipantTurn(game.participants, participantIndex);

  const newAction = {
    gameId,
    playerId,
    actionType: PLAYER_ACTIONS.RAISE,
    gameRound: game.round,
    chips: bettingChips,
    bettedValue,
    totalBettedValue: newTotalBettedValue
  };

  await commonHandler.updateGame(game);
  await actionsCommonHandler.createAction(newAction);
}

const raiseHandler = { doRaise };
export default raiseHandler;
