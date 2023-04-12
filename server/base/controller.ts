import { validateOrReject } from 'class-validator';
import type { SocketWithToken } from '../authorization/types';
import type { Socket } from 'socket.io';

export class BaseSocketController {
  registerUserConnection(socket: Socket) {
    socket.join(this.getUserRoomId(socket));
  }

  unregisterUserConnection(socket: Socket) {
    socket.leave(this.getUserRoomId(socket));
  }

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

  getCurrentUser(socket: Socket) {
    return (socket as SocketWithToken).decodedToken;
  }

  getUserRoomId(socket: Socket) {
    return this.getCurrentUser(socket).id;
  }

  async validateMessage<T extends object>(message: T) {
    await validateOrReject(message);
  }
}
