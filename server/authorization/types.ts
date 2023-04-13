import { Socket } from 'socket.io';

export interface JwtUserPayload {
  id: string;
  email: string;
}

export interface JwtPayload extends JwtUserPayload {
  iat: number;
  exp: number;
}

export interface JwtUser extends JwtUserPayload {
  token: string | string[];
}

export class SocketWithToken extends Socket {
  decodedToken?: JwtUser;
}
