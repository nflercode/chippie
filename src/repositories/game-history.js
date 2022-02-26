import thinky from 'thinky';
import dbConfig from './rdbConfig.js';
import { GAME_STATUSES } from '../constants/game-statuses.js';
import { PARTICIPATION_STATUSES } from '../constants/participation-statuses.js';

const t = thinky(dbConfig);

const HistoryGame = t.createModel('HistoryGame', {
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

async function create (game) {
  game.updatedAt = Date.now();

  const newHistoryGame = new HistoryGame(game);
  return HistoryGame.save(newHistoryGame);
}

async function get (gameId) {
  return HistoryGame.get(gameId).run();
}

async function update (game) {
  game.updatedAt = Date.now();

  return HistoryGame.get(game.id).update(game);
}

const historyGameRepository = { create, get, update };
export default historyGameRepository;
