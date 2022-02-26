import { createClient } from 'redis';

let client;

async function connect () {
  client = createClient();

  client.on('error', (err) => console.error('Error connecting to Redis', err));
  client.on('ready', () => console.log('Successfully connected to Redis'));

  await client.connect();
}

async function getOrSet (key, dbCallback) {
  let data = await get(key);
  if (data) return data;

  console.log('Cached key', key, 'did not exist in cache. Retrieving data with dbCallback.');

  data = await dbCallback();
  await set(key, data);

  return data;
}

async function set (key, value) {
  await client.set(key, JSON.stringify(value));
}

async function del (key) {
  await client.del(key);
}

async function get (key) {
  const data = await client.get(key);
  if (data) return JSON.parse(data);
}

export { connect, getOrSet, set, get, del };
