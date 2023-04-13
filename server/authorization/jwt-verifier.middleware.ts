import type { MiddlewareInterface } from 'socket-controllers';
import { Middleware } from 'socket-controllers';
import type { Socket } from 'socket.io';
import { verify } from 'jsonwebtoken';
import { Service } from 'typedi';
import type { JwtPayload, SocketWithToken } from './types';

const SECRET_KEY = 'your secret or public key';

@Middleware()
@Service()
export class JwtVerifierMiddleware implements MiddlewareInterface {
  use(socket: Socket, next: (err?: Error) => void) {
    try {
      if (socket.handshake.auth && socket.handshake.auth.token) {
        const token = socket.handshake.auth.token;
        verify(token, SECRET_KEY, function (err, decoded) {
          if (err) {
            throw new Error(err.message);
          }
          const { id, email, exp }: JwtPayload = decoded;

          // schedules the socket to disconnect as soon as the token expires
          const expiresIn = Math.max(0, exp * 1000 - new Date().getTime());
          setTimeout(() => {
            socket.emit('token_expired', token);
            socket.disconnect(true);
          }, expiresIn);

          if (!(id && email)) {
            throw new Error('Authentication error');
          }

          (socket as SocketWithToken).decodedToken = {
            id,
            email,
            token,
          };
          next();
        });
      } else {
        throw new Error('Authentication error');
      }
    } catch (e) {
      console.log(e);
      next(e as Error);
    }
  }
}
