import API_STATUS_CODES from '../../constants/api-status-codes.js';
import { ClientFriendlyException } from '../../exceptions/ClientFriendlyException.js';
import playerService from '../../services/player-service.js';
import gameHandler from '../../handlers/game-handler.js';
import { DEFAULT_DISTRIBUTION } from '../chip-distribution-configs.js';
import chipService from '../../services/chip-service.js';
import gameService from '../../services/game-service.js';
import { PARTICIPATION_STATUSES } from '../../constants/participation-statuses.js';

async function doCreateGame (tableId, playerId) {
  const ongoingGame = await gameHandler.getOngoingGame(tableId);
  if (ongoingGame) {
    throw new ClientFriendlyException(
      'Table already has an ongoing game',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  const players = await playerService.findPlayers(tableId);
  if (!players || players.length < 1) {
    throw new ClientFriendlyException(
      'There are no players',
      API_STATUS_CODES.BAD_REQUEST
    );
  }

  const startingChips = await _getStartingChips();
  const participants = _createParticipants(players, startingChips);

  await gameService.createGame(tableId, participants, playerId);
}

async function _getStartingChips () {
  const allChips = await chipService.getAllChips();
  if (!allChips || allChips.length === 0) {
    throw new ClientFriendlyException(
      'Failed to get chips',
      API_STATUS_CODES.INTERNAL_ERROR
    );
  }

  const distributionConfigMerged = allChips.map((chip) => {
    const currentConfig = DEFAULT_DISTRIBUTION[chip.type];
    if (currentConfig) {
      return {
        chipId: chip.id,
        amount: currentConfig.amount
      };
    }

    return undefined;
  }).filter(Boolean);

  return distributionConfigMerged;
}

function _createParticipants (players, startingChips) {
  const playerIds = players.map((p) => p.id);

  const maxTurnOrder = playerIds.length;
  const participants =
    playerIds
      .sort(() => Math.random() - 0.5)
      .map((playerId, i) => ({
        playerId,
        turnOrder: ++i,
        seat: gameHandler.getSeatByTurnOrder(i, maxTurnOrder),
        isCurrentTurn: i === 1,
        participationStatus: PARTICIPATION_STATUSES.PARTICIPATING,
        chips: startingChips
      }));

  return participants;
}

const createGameHandler = { doCreateGame };
export default createGameHandler;
