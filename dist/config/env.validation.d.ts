import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    NODE_ENV: z.ZodEnum<["local", "development", "production"]>;
    PORT: z.ZodEffects<z.ZodDefault<z.ZodNumber>, number, unknown>;
    DATABASE_URL: z.ZodString;
    JWT_ACCESS_TOKEN_SECRET: z.ZodString;
    JWT_REFRESH_TOKEN_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRES_IN: z.ZodString;
    JWT_REFRESH_EXPIRES_IN: z.ZodString;
    STATIC_TOKEN: z.ZodString;
    SALT_ROUNDS: z.ZodString;
}, "strip", z.ZodTypeAny, {
    NODE_ENV: "local" | "development" | "production";
    PORT: number;
    DATABASE_URL: string;
    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    STATIC_TOKEN: string;
    SALT_ROUNDS: string;
}, {
    NODE_ENV: "local" | "development" | "production";
    DATABASE_URL: string;
    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    STATIC_TOKEN: string;
    SALT_ROUNDS: string;
    PORT?: unknown;
}>;
export type EnvVars = z.infer<typeof envSchema>;
