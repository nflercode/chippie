import thinky from 'thinky';
import dbConfig from './rdbConfig.js';
import { Subject } from 'rxjs';
import { handleFeed } from './helpers.js';
import { POT_REQUEST_STATUS } from '../constants/pot-request-status.js';
import { POT_REQUEST_PLAYER_ANSWERS } from '../constants/pot-request-player-answers.js';

const subject = new Subject();
const t = thinky(dbConfig);
const r = t.r;

const PotRequest = t.createModel('PotRequest', {
  id: t.type.string(),
  tableId: t.type.string(),
  gameId: t.type.string(),
  playerId: t.type.string(),
  status: t.type.string().enum(Object.values(POT_REQUEST_STATUS)).default(POT_REQUEST_STATUS.UNDEFINED),
  participantAnswers: t.type.array().schema(t.type.object().schema({
    playerId: t.type.string(),
    answer: t.type.string().enum(Object.values(POT_REQUEST_PLAYER_ANSWERS)).default(POT_REQUEST_PLAYER_ANSWERS.UNDEFINED)
  })),
  createdAt: t.type.date().default(r.now())
});

async function createPotRequest (tableId, gameId, playerId, participantAnswers) {
  const newPotRequest = new PotRequest({
    tableId,
    gameId,
    playerId,
    status: POT_REQUEST_STATUS.AWAITING,
    participantAnswers
  });

  return PotRequest.save(newPotRequest);
}

async function updatePotRequest (potRequest) {
  return PotRequest.get(potRequest.id).update(potRequest);
}

async function getRequest (requestId) {
  return PotRequest.get(requestId).run();
}

async function getByGameId (gameId) {
  return PotRequest.filter({ gameId }).run();
}

PotRequest.changes().then(feed => handleFeed(feed, subject));

const potRequestRepository = {
  createPotRequest,
  getByGameId,
  updatePotRequest,
  getRequest,
  subject
};
export default potRequestRepository;
