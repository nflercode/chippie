import { getOrSet, set } from '../cache/client.js';
import potRequestRepository from '../repositories/pot-request-repository.js';

async function create (tableId, gameId, playerId, participantAnswers) {
  try {
    const newPotRequest = await potRequestRepository.create(tableId, gameId, playerId, participantAnswers);

    const cacheKey = generateCacheKey(gameId);
    await set(cacheKey, newPotRequest);

    return newPotRequest;
  } catch (err) {
    console.error('Failed to create pot request.', err);
  }
}

async function get (gameId) {
  try {
    const cacheKey = generateCacheKey(gameId);
    return await getOrSet(cacheKey, async () => {
      const potRequests = await potRequestRepository.find(gameId)[0];
      return potRequests[0];
    });
  } catch (err) {
    console.error('Failed to find ongoing request', err);
  }
}

async function update (request) {
  try {
    const updatedPotRequest = await potRequestRepository.update(request);

    const cacheKey = generateCacheKey(request.gameId);
    await set(cacheKey, updatedPotRequest);

    return updatedPotRequest;
  } catch (err) {
    console.error('Failed to update request', err);
  }
}

function generateCacheKey (gameId) {
  const cacheKey = 'potRequest';
  return `${cacheKey}_${gameId}`;
}

const potRequestService = { create, get, update };
export default potRequestService;
