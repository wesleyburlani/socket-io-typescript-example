import { spawn } from 'child_process';
import * as express from 'express';
import type { Request, Response } from 'express';
import { getEnvironmentKeys } from '../common/env';

const { LOAD_BALANCER_URL, NUMBER_OF_SERVERS_TO_SPAWN } = getEnvironmentKeys();
const LOAD_BALANCER_PORT = Number(new URL(LOAD_BALANCER_URL).port);

function spawnServer(port: number) {
  const server = spawn('npm', ['run', 'server'], {
    env: { ...process.env, PORT: port.toString() },
  });
  server.stdout.on('data', buff => {
    const line = buff.toLocaleString();
    console.info(`[Server ${port}]`, line);
  });
  server.stderr.on('data', buff => {
    const line = buff.toLocaleString();
    console.info(`[Server ${port}]`, line);
  });
}

let LAST_USED_SERVER_PORT = 0;
const ports: number[] = [];
for (let i = 1; i <= NUMBER_OF_SERVERS_TO_SPAWN; i++) {
  const port = LOAD_BALANCER_PORT + i;
  spawnServer(port);
  ports.push(port);
}

const app = express();

app.get('/address', (req: Request, resp: Response) => {
  LAST_USED_SERVER_PORT = (LAST_USED_SERVER_PORT + 1) % ports.length;
  resp.send({
    address: `ws://localhost:${ports[LAST_USED_SERVER_PORT]}`,
  });
});

app.listen(LOAD_BALANCER_PORT);
