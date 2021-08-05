import { Server as SocketIo } from 'socket.io'
import { getRoomName } from './socketRoomHelpers.js';
import { jwtAuth } from './middlewares/jwtAuthentication.js';

const _allSockets = {};
let io;

function connect(httpServer, allowedOrigins) {
  if (io)
    return io;

  io = new SocketIo(httpServer, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET"]
    }
  });

  io = io.of('/chippie');
  io.use(jwtAuth);

  io.on('connection', (socket) => {
    const { auth } = socket;
    const roomId = getRoomName(auth.tableId);

    socket.join(roomId);

    console.log('Successfully connected player', auth.playerId, 'to room', roomId);

    socket.on('disconnect', () => {
      console.log('Disconneting socket for', auth.playerId);
      delete _allSockets[auth.playerId];
    });

    _allSockets[auth.playerId] = socket;
  });
}

export { connect, io};