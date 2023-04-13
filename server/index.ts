import 'es6-shim'; // this shim is optional if you are using old version of node
import 'reflect-metadata'; // this shim is required
import { SocketControllers } from 'socket-controllers';
import { Container } from 'typedi'; // Only if you are using typedi
import { Server } from 'socket.io';
import { join, normalize } from 'path';
import type { Request, Response } from 'express';
import * as express from 'express';
import * as http from 'http';
import { createClient } from 'redis';
import { createAdapter } from '@socket.io/redis-adapter';
import { getEnvironmentKeys } from '../common/env';

const { REDIS_CONNECTION_STRING } = getEnvironmentKeys();

const pubClient = createClient({ url: REDIS_CONNECTION_STRING });
const subClient = pubClient.duplicate();

const app = express();
const server = new http.Server(app);
const io = new Server(server);

Promise.all([pubClient.connect(), subClient.connect()]).then(() => {
  io.adapter(createAdapter(pubClient, subClient));
  server.listen(process.env.PORT || 3001);
});

app.get('/', function (req: Request, res: Response) {
  res.send('hello express');
});

const controllersPath = normalize(join(__dirname, '*', '*.controller.ts'));
const middlewaresPath = normalize(join(__dirname, '*', '*.middleware.ts'));

new SocketControllers({
  io,
  container: Container,
  middlewares: [middlewaresPath],
  controllers: [controllersPath],
});
