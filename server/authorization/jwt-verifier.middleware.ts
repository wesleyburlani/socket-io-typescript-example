import type { MiddlewareInterface } from 'socket-controllers';
import { Middleware } from 'socket-controllers';
import { verify } from 'jsonwebtoken';
import { Service } from 'typedi';
import type { JwtPayload, SocketWithToken } from './types';
import { getEnvironmentKeys } from '../../common/env';

const { JWT_SIGNINGKEY } = getEnvironmentKeys();

/**
 * Verifies if the current socket connection is authorized to
 * connect by checking the connection handshake.
 * the field `handshake.auth.token` must containt a valid JWT
 * token in it.
 *
 * ```Typescript
   // client implementation
   import { Socket } from 'socket.io-client';
   const socket = io.connect(SERVER_ADDRESS, {
    auth: {
      ['token']: JWT_TOKEN,
    },
  });
 * ````
 * * if the token is not valid or has expired it will throw Error
 * * if the is valid it will connect
 * * when the token expires it will emit an `token_expired` event and disconnect the client
 *
 * To the the client connected in case of token expiration, the client should listen for
 * `token_expired` events and flag the socket, for example
 *
 * ```Typescript
  socket.on('token_expired', err => {
    socket.tokenExpired = true;
  });
 * ```
 *
 * Then, once the client receives the disconnection and the flag is set as `true`, the client
 * can simply refresh the token and reconnect
 *
 * ```Typescript
  socket.on('disconnect', reason => {
    if (socket.tokenExpired) {
      socket.auth['token'] = generateNewToken();
      socket.connect();
    }
  });
 * ```
 * **NOTE**: the event `token_expired` will be emitted only if the
 * token was valid for a while before expiring. If the client sends an
 * already expired token, the server will throw Error and client will
 * receive and `connect_error` event. In this case, if the client
 * needs to reconnect, it should refresh the token on while it receives
 * a `connect_error` with the message `jwt expired`
 *
 * ```Typescript
  socket.on('connect_error', err => {
    if (err.message === 'jwt expired') {
      socket.auth['token'] = generateNewToken();
      socket.connect();
    }
  });
 * ```
 */
@Middleware()
@Service()
export class JwtVerifierMiddleware implements MiddlewareInterface {
  use(socket: SocketWithToken, next: (err?: Error) => void) {
    try {
      if (!socket.handshake.auth || !socket.handshake.auth.token) {
        throw new Error('missing token');
      }
      const token = socket.handshake.auth.token;

      const { id, email, exp } = verify(token, JWT_SIGNINGKEY) as JwtPayload;

      if (!(id && email)) {
        throw new Error('jwt required field are not available on the token');
      }
      // schedules the socket to disconnect as soon as the token expires
      const expiresIn = Math.max(0, exp * 1000 - new Date().getTime());
      setTimeout(() => {
        socket.emit('token_expired', token);
        socket.disconnect(true);
      }, expiresIn);

      socket.decodedToken = { id, email, token };
      next();
    } catch (e) {
      console.log((e as Error).message);
      next(e as Error);
    }
  }
}
