import {
  SocketController,
  ConnectedSocket,
  MessageBody,
  OnMessage,
  EmitOnFail,
  EmitOnSuccess,
} from 'socket-controllers';
import { Socket } from 'socket.io';
import { Service } from 'typedi';
import { Message } from './types';
import { BaseSocketController } from '../base/controller';

@SocketController()
@Service()
export class MessageController extends BaseSocketController {
  @OnMessage('save')
  @EmitOnSuccess('save_success')
  @EmitOnFail('save_error')
  async save(@ConnectedSocket() socket: Socket, @MessageBody() message: Message) {
    await this.validateMessage(message);
    const user = this.getCurrentUser(socket);
    console.log('user:', user);
    console.log('received message:', message);
    message.id = 1;
    this.emitToAllUserConnections(socket, 'save_success', message, {
      ignoreCurrentConnection: true,
    });
    return message;
  }
}
