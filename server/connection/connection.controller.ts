import { OnConnect, SocketController, ConnectedSocket, OnDisconnect } from 'socket-controllers';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { BaseSocketController } from '../base/controller';

@SocketController()
@Service()
export class ConnectionController extends BaseSocketController {
  @OnConnect()
  connection(@ConnectedSocket() socket: Socket) {
    this.registerUserConnection(socket);
    console.log('client connected');
  }

  @OnDisconnect()
  disconnect(@ConnectedSocket() socket: Socket) {
    this.unregisterUserConnection(socket);
    console.log('client disconnected');
  }
}
