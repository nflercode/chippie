import thinky from 'thinky';
import dbConfig from './rdbConfig.js';
import { Subject } from 'rxjs';
import { handleFeed } from './helpers.js';

const subject = new Subject();
const t = thinky(dbConfig);
const r = t.r;

const GAME_STATUSES = {
  UNDEFINED: "UNDEFINED",
  ONGOING: "ONGOING",
  ENDED: "ENDED"
}

const Game = t.createModel('Game', {
  id: t.type.string(),
  tableId: t.type.string(),
  status: t.type.string().enum(Object.values(GAME_STATUSES)).default(GAME_STATUSES.UNDEFINED),
  round: t.type.number(),
  participants: t.type.array().schema(t.type.object().schema({
    playerId: t.type.string(),
    turnOrder: t.type.number(),
    isCurrentTurn: t.type.boolean(),
    lastActionId: t.type.string(),
    chips: t.type.array().schema(t.type.object().schema({
      chipId: t.type.string(),
      amount: t.type.number()
    }))
  })),
  pot: t.type.array().schema(t.type.object().schema({
    chipId: t.type.string(),
    amount: t.type.number()
  })),
  createdAt: t.type.date().default(r.now()),
  updatedAt: t.type.date()
});

async function createGame(tableId, participants) {
  const newGame = new Game({
    tableId,
    round: 1,
    status: GAME_STATUSES.ONGOING,
    participants,
    pot: [],
    updatedAt: null
  });

  return Game.save(newGame);
}

async function getGame(gameId) {
  return Game.get(gameId).run();
}

async function getByTableId(tableId) {
  return Game.filter({ tableId }).run();
}

async function updateGame(game) {
  return Game.get(game.id).update(game);
}

Game.changes().then(feed => handleFeed(feed, subject));

const gameRepository = { createGame, getGame, updateGame, getByTableId, GAME_STATUSES, subject }
export default gameRepository;