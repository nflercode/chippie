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

async function find (tableId) {
  return Player.filter({ tableId }).run();
}

const playerRepository = { find };
export default playerRepository;
