import thinky from 'thinky';
import dbConfig from './rdbConfig.js';
import { Subject } from 'rxjs';
import { handleFeed } from './helpers.js';
import { GAME_STATUSES } from '../constants/game-statuses.js';
import { PARTICIPATION_STATUSES } from '../constants/participation-statuses.js';
import { PARTICIPANT_SEATS } from '../constants/participant-seats.js';
import { BUY_IN_PRICES } from '../constants/buy-in-prices.js';

const subject = new Subject();
const t = thinky(dbConfig);
const r = t.r;

const Game = t.createModel('Game', {
  id: t.type.string(),
  tableId: t.type.string(),
  round: t.type.number(),
  status: t.type.string().enum(Object.values(GAME_STATUSES)).default(GAME_STATUSES.UNDEFINED),
  createdBy: t.type.string(),
  closedBy: t.type.string(),
  bigBuyIn: t.type.number(),
  smallBuyIn: t.type.number(),
  participants: t.type.array().schema(t.type.object().schema({
    playerId: t.type.string(),
    turnOrder: t.type.number(),
    seat: t.type.string().enum(Object.values(PARTICIPANT_SEATS)).default(PARTICIPANT_SEATS.UNDEFINED),
    isCurrentTurn: t.type.boolean(),
    participationStatus: t.type.string().enum(Object.values(PARTICIPATION_STATUSES))
      .default(PARTICIPATION_STATUSES.UNDEFINED),
    placing: t.type.number(),
    chips: t.type.array().schema(t.type.object().schema({
      chipId: t.type.string(),
      amount: t.type.number()
    }))
  }).options({ enforce_extra: 'remove' })),
  pot: t.type.array().schema(t.type.object().schema({
    chipId: t.type.string(),
    amount: t.type.number()
  })),
  createdAt: t.type.date().default(Date.now),
  updatedAt: t.type.date()
});

async function createGame (tableId, participants, createdByPlayerId) {
  const newGame = new Game({
    tableId,
    round: 1,
    bigBuyIn: BUY_IN_PRICES.BIG_BUY_IN,
    smallBuyIn: BUY_IN_PRICES.SMALL_BUY_IN,
    createdBy: createdByPlayerId,
    status: GAME_STATUSES.ONGOING,
    participants,
    pot: [],
    updatedAt: null
  });

  return Game.save(newGame);
}

async function getGame (gameId) {
  return Game.get(gameId).run();
}

async function getByTableId (tableId) {
  return Game.filter({ tableId }).run();
}

async function updateGame (game) {
  game.updatedAt = r.now();
  return Game.get(game.id).update(game);
}

Game.changes().then(feed => handleFeed(feed, subject));

const gameRepository = { createGame, getGame, updateGame, getByTableId, GAME_STATUSES, subject };
export default gameRepository;
