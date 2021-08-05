import thinky from 'thinky';
import dbConfig from './rdbConfig.js';

const t = thinky(dbConfig);
const r = t.r;

const Player = t.createModel('Player', {
  id: t.type.string(),
  tableId: t.type.string(),
  avatarId: t.type.string(),
  name: t.type.string().min(1),
  createdAt: t.type.date().default(r.now()),
  updatedAt: t.type.date()
});

async function findPlayers(tableId) {
  return Player.filter({ tableId }).run();
}

async function getPlayer(playerId) {
  return Player.get(playerId).run();
}

const playerRepository = { findPlayers, getPlayer }
export default playerRepository;