import gameRepository from '../repositories/game-repository.js';
import { getRoomName } from '../sockets/socketRoomHelpers.js';
import { io } from '../sockets/tableSocket.js';

function start() {
  gameRepository.subject
    .subscribe({
      next: (event) => {
        switch(event.type) {
          case "UPDATED":
            handleUpdate(event);
            break;
          case "CREATED":
            handleCreate(event);
            break;
          case "DELETED":
            handleDelete(event);
            break;
        }
      },
      error: (err) => {
        console.error(err);
    }
  });
}

function handleDelete(event) {

}

async function handleCreate(event) {
  const { tableId } = event.doc;
  const room = getRoomName(tableId);
  console.log('Sending game created notification to room', room);
  try {
    io.to(room).emit('game-created', event.doc);
    console.log('Successfully sent game created notification, to', room);
  } catch (err) {
    console.error('Failed to send created game notification', err);
  }
}

function handleUpdate(event) {
  const { tableId } = event.newValue;
  const room = getRoomName(tableId);
  io.to(room).emit('game-updated', event.newValue);
}

const dbEventHandlerGame = { start }
export default dbEventHandlerGame;