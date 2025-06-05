import { validatedEnv } from "./validate-env";

interface JwtTokenConfig {
    secret: string;
    expiresIn: string;
}

export interface EnvConfig {
    nodeEnv: string;
    port: number;
    databaseUrl: string;
    apikey: string;
    saltRounds: number;
    jwt: {
        access: JwtTokenConfig;
        refresh: JwtTokenConfig;
    };
    secretKey?: string;
    iv?: string;
}

const {
    NODE_ENV,
    PORT,
    DATABASE_URL,
    STATIC_TOKEN,
    SALT_ROUNDS,
    JWT_ACCESS_TOKEN_SECRET,
    JWT_REFRESH_TOKEN_SECRET,
    JWT_ACCESS_EXPIRES_IN,
    JWT_REFRESH_EXPIRES_IN,
    SECRET_KEY,
    IV,
} = validatedEnv;

export const envConfiguration = (): EnvConfig => ({
    nodeEnv: NODE_ENV,
    port: Number(PORT),
    databaseUrl: DATABASE_URL,
    apikey: STATIC_TOKEN,
    saltRounds: Number(SALT_ROUNDS),
    jwt: {
        access: {
            secret: JWT_ACCESS_TOKEN_SECRET,
            expiresIn: JWT_ACCESS_EXPIRES_IN,
        },
        refresh: {
            secret: JWT_REFRESH_TOKEN_SECRET,
            expiresIn: JWT_REFRESH_EXPIRES_IN,
        },
    },
    secretKey: SECRET_KEY,
    iv: IV,
});
