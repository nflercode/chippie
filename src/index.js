import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import http from 'http';
import apiLoader from './apis/api-loader.js';
import { connect as connectSocket } from './sockets/tableSocket.js';
import { isProductionEnvironment, isPrEnvironment, assumeLocal } from './helpers/environment-helper.js';
import dbEventHandlerGame from './db-event-handlers/game.js';
import dbEventHandlerAction from './db-event-handlers/action.js';
import dbEventHandlerPotRequest from './db-event-handlers/pot-request.js';
import { connect as connectToRedis } from './cache/client.js';
import chipService from './services/chip-service.js';

const allowedOrigins = [];

console.log('Env is:', process.env.ENVIRONMENT);

if (assumeLocal()) {
  console.log('starting as local');
  dotenv.config({ path: process.cwd() + '/.env.local' });
  allowedOrigins.push(/http:\/\/localhost:\d+/);
}

if (isProductionEnvironment()) {
  console.log('starting as production');
  allowedOrigins.push(/https:\/\/mychips.online/);
}

if (isPrEnvironment()) {
  console.log('starting as prenv');
  allowedOrigins.push(/https:\/\/pr-\d+.mychips.online/);
  allowedOrigins.push(/http:\/\/localhost:\d+/);
}

const app = express();
app.use(express.json());
app.use(cors({
  origin: function (origin, callback) {
    if (allowedOrigins.find((o) => o.test(origin))) { return callback(null, true); }

    callback();
  }
}));

(async () => {
  await connectToRedis();

  const chips = await chipService.getAllChips();
  if (!chips || chips.length === 0) {
    chipService.createDefaultChips();
  } else {
    console.log('Chips already exist');
  }
})();

const httpServer = http.createServer(app);
connectSocket(httpServer, allowedOrigins);

dbEventHandlerGame.start();
dbEventHandlerAction.start();
dbEventHandlerPotRequest.start();

apiLoader.loadApis(app);

const port = 3001;
httpServer.listen(port, () => {
  console.log(`listening at http://localhost:${port}`);
});
