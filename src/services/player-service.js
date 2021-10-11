import playerRepository from '../repositories/player-repository.js';

async function findPlayers (tableId) {
  try {
    const players = await playerRepository.findPlayers(tableId);
    return players;
  } catch (err) {
    console.error('Failed to find players!', err);
  }
}

async function getPlayer (playerId) {
  try {
    const players = await playerRepository.getPlayer(playerId);
    return players;
  } catch (err) {
    console.error('Failed to find players!', err);
  }
}

const playerService = { findPlayers, getPlayer };
export default playerService;
