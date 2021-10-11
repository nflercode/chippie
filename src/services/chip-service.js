import chipRepository from '../repositories/chip-repository.js';

async function getAllChips () {
  try {
    return await chipRepository.getAllChips();
  } catch (err) {
    console.error('Failed to get all chips', err);
  }
}

const chipService = { getAllChips };
export default chipService;
