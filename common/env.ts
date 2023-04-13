import * as path from 'path';

import * as dotenv from 'dotenv';
import { z } from 'zod';

const schema = z.object({
  EMIT_EVENT: z.string().optional(),
  JWT_SIGNINGKEY: z.string(),
  REDIS_CONNECTION_STRING: z.string().url(),
  LOAD_BALANCER_URL: z.string().url(),
});

export type Environment = z.infer<typeof schema>;

export function setupEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  dotenv.config({ path: envPath });
  schema.parse(process.env);
}

export function getEnvironmentKeys() {
  return schema.parse(process.env);
}

setupEnv();
