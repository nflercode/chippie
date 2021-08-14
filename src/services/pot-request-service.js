import potRequestRepository from '../repositories/pot-request-repository.js';

async function createPotRequest(tableId, gameId, playerId, participantAnswers) {
  try {
    const createPotRequest = await potRequestRepository.createPotRequest(tableId, gameId, playerId, participantAnswers);
    return createPotRequest;
  } catch (err) {
    console.error('Failed to create pot request.', err);
  }
}

async function findRequestsForGame(gameId) {
  try {
    const requests = await potRequestRepository.getByGameId(gameId);
    return requests;
  } catch (err) {
    console.error('Failed to find ongoing request', err);
  }
}

async function getRequest(requestId) {
  try {
    return await potRequestRepository.getRequest(requestId);
  } catch (err) {
    console.error('Failed to find ongoing request', err);
  }
}

async function updateRequest(request) {
  try {
    return await potRequestRepository.updatePotRequest(request);
  } catch (err) {
    console.error('Failed to update request', err);
  }
}

const potRequestService = { createPotRequest, findRequestsForGame, updateRequest, getRequest }
export default potRequestService;