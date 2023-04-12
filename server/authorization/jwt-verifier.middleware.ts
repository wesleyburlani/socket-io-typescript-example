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
      if (socket.handshake.query && socket.handshake.query.token) {
        const token = socket.handshake.query.token;
        verify(token, SECRET_KEY, function (err, decoded) {
          if (err) {
            throw new Error('Authentication error');
          }
          const { id, email }: JwtPayload = decoded;
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
