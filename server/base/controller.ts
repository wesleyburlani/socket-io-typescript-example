import { validateOrReject } from 'class-validator';
import type { SocketWithToken } from '../authorization/types';
import type { Socket } from 'socket.io';

/**
 * Base class controller with useful methods that can help
 * another classes that implements a `@SocketController`.
 *
 * example:
 *```Typescript
  `@SocketController()`
  `@Service()`
  export class ConnectionController extends BaseSocketController {
    `@OnConnect()`
    connection(@ConnectedSocket() socket: Socket) {
      this.registerUserConnection(socket);
    }
  }
 *```
 */
export class BaseSocketController {
  /**
   * registers the current socket on the room that contains
   * all the connections from the same user
   */
  registerUserConnection(socket: Socket) {
    socket.join(this.getUserRoomId(socket));
  }

  /**
   * unregisters the current socket on the room that contains
   * all the connections from the same user
   */
  unregisterUserConnection(socket: Socket) {
    socket.leave(this.getUserRoomId(socket));
  }

  /**
   * emits an event to all the sockets that are connected and
   * are owned by the same user as the current connected socket
   */
  emitToAllUserConnections(
    socket: Socket,
    event: string,
    message: object,
    { ignoreCurrentConnection = false },
  ): void {
    socket.to(this.getUserRoomId(socket)).emit(event, message);
    if (!ignoreCurrentConnection) {
      socket.emit(event, message);
    }
  }

  /**
   * returns the decoded token received from the connection
   * authentication.
   */
  getSocketUser(socket: Socket) {
    return (socket as SocketWithToken).decodedToken;
  }

  /**
   * returns the id of the room used that contains
   * all sockets that remains to the same user.
   */
  getUserRoomId(socket: Socket) {
    return this.getSocketUser(socket).id;
  }

  /**
   * validates a message receive using `class-validator`
   * it is just a wrapper to the function `validateOrReject`
   * from the library `class-validator`
   */
  async validateMessage<T extends object>(message: T) {
    await validateOrReject(message);
  }
}
