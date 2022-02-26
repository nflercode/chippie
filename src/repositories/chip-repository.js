import thinky from 'thinky';
import { CHIP_TYPES } from '../constants/chip-types.js';
import dbConfig from './rdbConfig.js';

const t = thinky(dbConfig);

const Chip = t.createModel('Chip', {
  id: t.type.string(),
  type: t.type.string().enum(Object.values(CHIP_TYPES)).required(),
  value: t.type.number().required(),
  imgName: t.type.string().optional()
});

async function create (chips) {
  return await Chip.save(chips);
}

async function getAllChips () {
  return Chip.run();
}

const chipRepository = { create, getAllChips, Chip };
export default chipRepository;
