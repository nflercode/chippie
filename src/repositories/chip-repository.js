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

const defaultChips = [
  {
    type: CHIP_TYPES.WHITE,
    value: 10
  },
  {
    type: CHIP_TYPES.RED,
    value: 50
  },
  {
    type: CHIP_TYPES.BLUE,
    value: 100
  },
  {
    type: CHIP_TYPES.GREEN,
    value: 250
  },
  {
    type: CHIP_TYPES.BLACK,
    value: 1000
  }
]

async function createDefaultChips() {
  await Chip.save(defaultChips);
  console.log('Default chip has been created!');
}

async function getAllChips() {
  return Chip.run();
}

const chipRepository = { createDefaultChips, getAllChips, Chip }
export default chipRepository;