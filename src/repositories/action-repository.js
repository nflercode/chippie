import thinky from 'thinky';
import dbConfig from './rdbConfig.js';
import { Subject } from 'rxjs';
import { handleFeed } from './helpers.js';
import { PLAYER_ACTIONS } from '../constants/player-actions.js';

const subject = new Subject();
const t = thinky(dbConfig);

const Action = t.createModel('Action', {
  id: t.type.string(),
  gameId: t.type.string(),
  playerId: t.type.string(),
  actionType: t.type.string().enum(Object.values(PLAYER_ACTIONS)).default(PLAYER_ACTIONS.UNDEFINED),
  gameRound: t.type.number(),
  chips: t.type.array().schema(t.type.object().schema({
    chipId: t.type.string(),
    amount: t.type.number()
  })),
  totalValue: t.type.number(),
  createdAt: t.type.date().default(Date.now)
});

async function createAction (action) {
  const newAction = new Action(action);
  return Action.save(newAction);
}

async function findActionsForGame (gameId, gameRound) {
  return Action.filter({ gameId, gameRound }).run();
}

Action.changes().then(feed => handleFeed(feed, subject));

const actionRepository = { createAction, findActionsForGame, subject };
export default actionRepository;
