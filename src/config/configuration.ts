// src/config/configuration.ts
import { z } from 'zod';

const envSchema = z.object({
  DB_NAME: z.string().default('database.sqlite'),
  GOOGLE_MAPS_API_KEY: z.string(),
  MELHOR_ENVIO_CLIENT_ID: z.string(),
  MELHOR_ENVIO_CLIENT_SECRET: z.string(),
  PORT: z.coerce.number().default(3000),
  NODE_ENV: z.enum(['development', 'production']).default('development')
});

export type EnvConfig = z.infer<typeof envSchema>;

export default () => ({
  env: envSchema.parse(process.env)
});