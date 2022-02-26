import chipRepository from '../repositories/chip-repository.js';
import { getOrSet, set } from '../cache/client.js';
import { CHIP_TYPES } from '../constants/chip-types.js';

const cacheKey = 'chips';
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
];

async function getAllChips () {
  try {
    return await getOrSet(cacheKey, chipRepository.getAllChips);
  } catch (err) {
    console.error('Failed to get all chips', err);
  }
}

async function createDefaultChips () {
  try {
    const storedChips = await chipRepository.create(defaultChips);
    await set(cacheKey, storedChips);

    return storedChips;
  } catch (err) {
    console.error('Failed to create default chips', err);
  }
}

const chipService = { getAllChips, createDefaultChips };
export default chipService;
