import thinky from 'thinky';
import dbConfig from './rdbConfig.js';
import { Subject } from 'rxjs';
import { handleFeed } from './helpers.js';
import { PLAYER_ACTIONS } from '../constants/player-actions.js';

const subject = new Subject();
const t = thinky(dbConfig);
const r = t.r;

const Action = t.createModel('Action', {
  id: t.type.string(),
  gameId: t.type.string(),
  playerId: t.type.string(),
  actionType: t.type.string().enum(Object.values(PLAYER_ACTIONS)).default(PLAYER_ACTIONS.UNDEFINED),
  chips: t.type.array().schema(t.type.object().schema({
    chipId: t.type.string(),
    amount: t.type.number()
  })),
  createdAt: t.type.date().default(r.now())
});

async function createAction(gameId, playerId, chips, actionType) {
  const newAction = new Action({
    gameId,
    playerId,
    chips,
    actionType
  });

  return Action.save(newAction);
}

async function getAllActionsForPlayer(playerId) {
  return Action.filter({ playerId }).run();
}

Action.changes().then(feed => handleFeed(feed, subject));

const actionRepository = { createAction, getAllActionsForPlayer, subject }
export default actionRepository;