// src/config/validate-env.ts
import { config } from 'dotenv';

import { envSchema } from './env.validation';
import { log } from 'console';

// 1) Load the correct .env file based on NODE_ENV (fallback to .env.local)
config({ path: `.env.${process.env.NODE_ENV || 'local'}` });

// 2) Validate and parse
const parsed = envSchema.safeParse(process.env);

// log('process.env.NODE_ENV', process.env.NODE_ENV);
// log('Parsed environment variables:', parsed);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  parsed.error.issues.forEach((issue) => {
    console.error(`  • ${issue.path.join('.')} — ${issue.message}`);
  });
  process.exit(1);
}

// console.log("parsed.data--->", parsed.data);


// 3) Export the fully-typed, validated env
export const validatedEnv = parsed.data;

