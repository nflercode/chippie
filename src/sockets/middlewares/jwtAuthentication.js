import { verifyAuthToken } from '../../jwt/tokenHandler.js';

function jwtAuth(socket, next) {
  const authToken = socket.handshake.auth.token;
  if (!authToken) {
    console.log('missing auth header, closing connection');
    return next(new Error('No auth token provided'));
  }

  const result = verifyAuthToken(authToken);
  if (!result) {
    return next(new Error('Not authorized'));
  }

  socket.auth = result;
  next();
}

export { jwtAuth }