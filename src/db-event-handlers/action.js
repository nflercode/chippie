import actionRepository from '../repositories/action-repository.js';
import gameService from '../services/game-service.js';
import { getRoomName } from '../sockets/socketRoomHelpers.js';
import { io } from '../sockets/tableSocket.js';

function start () {
  actionRepository.subject
    .subscribe({
      next: (event) => {
        switch (event.type) {
          case 'CREATED':
            handleCreate(event);
            break;
        }
      },
      error: (err) => {
        console.error(err);
      }
    });
}

async function handleCreate (event) {
  const { gameId } = event.doc;
  const game = await gameService.get(gameId);

  const room = getRoomName(game.tableId);
  io.to(room).emit('action-created', event.doc);
}

const dbEventHandlerAction = { start };
export default dbEventHandlerAction;
