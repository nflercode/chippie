import API_STATUS_CODES from "../constants/api-status-codes.js";
import { PLAYER_ACTIONS } from "../constants/player-actions.js";
import { ClientFriendlyException } from "../exceptions/ClientFriendlyException.js";
import commonHandler from "./common-handler.js";

async function doRaise(gameId, playerId, bettingChips) {
  let game = await commonHandler.getGame(gameId);

  const participantIndex =
    commonHandler.getParticipantIndex(game.participants, playerId);

  let participant = game.participants[participantIndex];
  commonHandler.assertIsCurrentTurn(participant);

  participant.chips = subtractChips(participant.chips, bettingChips);
  game.participants[participantIndex] = participant;

  game.pot = commonHandler.addChips(game.pot, bettingChips);

  const participantsWithSwitchedTurns =
    commonHandler.switchParticipantTurn(game.participants, participantIndex);

  game.participants = participantsWithSwitchedTurns;

  await commonHandler.updateGame(game);
  await commonHandler.createAction(gameId, playerId, bettingChips, PLAYER_ACTIONS.RAISE);
}

function subtractChips(chips, chipsToSubtract) {
  let chipsSubtracted = chips;

  chipsToSubtract.forEach(chipToSubtract => {
    const chipIndex = chipsSubtracted.findIndex(c => c.chipId === chipToSubtract.chipId);
    if (chipIndex === -1) {
      throw new ClientFriendlyException(
        'Participant tried to bet chip that whom does not have',
        API_STATUS_CODES.BAD_REQUEST
      );
    }
    const chip = chipsSubtracted[chipIndex];

    const newAmount = chip.amount - chipToSubtract.amount;

    if (newAmount < 0) {
      throw new ClientFriendlyException(
        'Participant tries to bet too many chips',
        API_STATUS_CODES.BAD_REQUEST
      );
    }

    chipsSubtracted[chipIndex].amount = newAmount;
  });

  return chipsSubtracted;
}

const raiseHandler = { doRaise };
export default raiseHandler;