import potRequestRepository from '../repositories/pot-request-repository.js';
import { getRoomName } from '../sockets/socketRoomHelpers.js';
import { io } from '../sockets/tableSocket.js';

function start() {
  potRequestRepository
  .subject
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
  io.to(room).emit('pot-request-created', event.doc);
}

function handleUpdate(event) {
  const { tableId } = event.newValue;
  const room = getRoomName(tableId);
  io.to(room).emit('pot-request-updated', event.newValue);
}

const dbEventHandlerPotRequest = { start }
export default dbEventHandlerPotRequest;