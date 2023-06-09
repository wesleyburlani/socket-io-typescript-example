import { getEnvironmentKeys } from '../common/env';
import { sign } from 'jsonwebtoken';
import * as io from 'socket.io-client';
import { Socket } from 'socket.io-client';

const { LOAD_BALANCER_URL, JWT_SIGNINGKEY } = getEnvironmentKeys();
let messageSent = false;

class SocketWithToken extends Socket {
  tokenExpired?: boolean;
}

function generateToken(expirationInMilliseconds: number) {
  return sign(
    {
      id: process.env.CLIENT_USER_ID || 'my_user_id',
      email: 'test@test.com',
      iat: 1680873520,
      exp: expirationInMilliseconds / 1000,
    },
    JWT_SIGNINGKEY,
  );
}

async function main() {
  const resp = await fetch(LOAD_BALANCER_URL + '/address');
  const json = await resp.json();
  const address = json.address;
  console.log('connecting to server', address);

  const socket: SocketWithToken = io.connect(json.address, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: Infinity,
    auth: {
      ['token']: generateToken(new Date().getTime() - 100000),
    },
  });

  socket.on('connect_error', err => {
    console.log('connection error:', err.message);
    if (err.message === 'jwt expired') {
      console.log('refreshing token');
      socket.auth['token'] = generateToken(new Date().getTime() + 600000);
      socket.connect();
    }
  });

  socket.on('token_expired', err => {
    console.log('token has expired:', err.message);
    socket.tokenExpired = true;
  });

  socket.on('disconnect', reason => {
    console.log('client has been disconnected:', reason);
    if (socket.tokenExpired) {
      console.log('refreshing token');
      socket.auth['token'] = generateToken(new Date().getTime() + 600000);
      socket.connect();
    }
  });

  socket.on('save_success', function (message) {
    console.log('save_success received from server:', message);
  });

  socket.on('save_error', function (message) {
    console.log('Save error:', message);
  });

  socket.on('connect', () => {
    console.log('client connected');
    socket.tokenExpired = false;
    if (process.env.EMIT_EVENT === 'true' && !messageSent) {
      console.log('emiting save event', { text: process.env.CLIENT_USER_ID });
      socket.emit('save', { text: process.env.CLIENT_USER_ID }, response => {
        console.log(response);
        messageSent = true;
      });
    }
  });
}

main();
