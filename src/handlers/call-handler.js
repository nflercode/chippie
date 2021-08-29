import API_STATUS_CODES from "../constants/api-status-codes.js";
import { PLAYER_ACTIONS } from "../constants/player-actions.js";
import { ClientFriendlyException } from "../exceptions/ClientFriendlyException.js";
import chipService from "../services/chip-service.js";
import actionsCommonHandler from "./commons/actions-common-handler.js";
import commonHandler from "./commons/common-handler.js";
import chipsCommonHandler from "./commons/chips-common-handler.js";
import rules from "./rules.js";
import actionService from "../services/action-service.js";

async function doCall(gameId, playerId, bettingChips) {
  let game = await commonHandler.getGame(gameId);

  const participantIndex = commonHandler.getParticipantIndex(game.participants, playerId);
  let participant = game.participants[participantIndex];
  commonHandler.assertIsCurrentTurn(participant);

  const actualChips = await chipService.getAllChips();
  const gameActions = await actionService.findActionsForGame(gameId, game.round);

  const bettingChipsWithValue = chipsCommonHandler.mapBettingChipWithValue(bettingChips, actualChips)
  const totalBettingAmount = chipsCommonHandler.getTotalValueFromChips(bettingChipsWithValue);

  const canICall = rules.canICall(gameActions, playerId, totalBettingAmount);
  if (!canICall) {
    throw new ClientFriendlyException(
      'You can not call',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  chipsCommonHandler.subtractChips(participant.chips, bettingChips);
  chipsCommonHandler.addChips(game.pot, bettingChips);

  commonHandler.switchParticipantTurn(game.participants, participantIndex);

  const newAction = {
    gameId,
    playerId,
    actionType: PLAYER_ACTIONS.CALL,
    gameRound: game.round,
    chips: bettingChips,
    totalValue: totalBettingAmount,
    raisedValue: 0
  }
  await commonHandler.updateGame(game);
  await actionsCommonHandler.createAction(newAction);
}

const callHandler = { doCall };
export default callHandler;