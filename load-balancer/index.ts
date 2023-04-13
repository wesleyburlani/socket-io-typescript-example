import { spawn } from 'child_process';
import * as express from 'express';
import type { Request, Response } from 'express';
import { getEnvironmentKeys } from '../common/env';

const { LOAD_BALANCER_URL } = getEnvironmentKeys();

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

let index = 0;
const ports = [3001, 3002];

ports.forEach(port => spawnServer(port));

const app = express();

app.get('/address', (req: Request, resp: Response) => {
  index = (index + 1) % ports.length;
  resp.send({
    address: `ws://localhost:${ports[index]}`,
  });
});

app.listen(new URL(LOAD_BALANCER_URL).port);
