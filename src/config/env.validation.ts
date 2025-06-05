import { z } from 'zod';

const toNumber = (val: unknown) =>
  typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))
    ? Number(val)
    : undefined;

export const envSchema = z.object({
  NODE_ENV: z.enum(['local', 'development', 'production']),
  PORT: z.preprocess(toNumber, z.number().default(3000)),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_TOKEN_SECRET: z.string(),
  JWT_REFRESH_TOKEN_SECRET: z.string(),
  JWT_ACCESS_EXPIRES_IN: z.string(),
  JWT_REFRESH_EXPIRES_IN: z.string(),

  STATIC_TOKEN: z.string(),
  SALT_ROUNDS: z.string(),

  SECRET_KEY: z.string(),
  IV: z.string()
});

export type EnvVars = z.infer<typeof envSchema>;
