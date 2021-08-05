import jwt from 'jsonwebtoken';

function verifyAuthToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_AUTH_SECRET);
  } catch (err) {
    console.error('Failed to verify auth token', err);
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    console.error('Failed to verify refresh token', err);
  }
}

export {
  verifyAuthToken,
  verifyRefreshToken
}