import { spawn } from 'child_process';

function spawnClient(id: number, userId: string, emitSaveEventOnConnect: boolean) {
  process.env.EMIT_EVENT = emitSaveEventOnConnect.toString();
  const client = spawn('npm', ['run', 'client'], {
    env: {
      CLIENT_USER_ID: userId,
      EMIT_EVENT: emitSaveEventOnConnect.toString(),
      ...process.env,
    },
  });
  client.stdout.on('data', buff => {
    const line = buff.toLocaleString();
    console.info(`[client ${id}, user: ${userId}, emit_event: ${emitSaveEventOnConnect}]`, line);
  });
  client.stderr.on('data', buff => {
    const line = buff.toLocaleString();
    console.info(`[client ${id}, user: ${userId}, emit_event: ${emitSaveEventOnConnect}]`, line);
  });
}

spawnClient(1, 'my_user_1', false);
spawnClient(2, 'my_user_2', false);
spawnClient(3, 'my_user_1', true);
