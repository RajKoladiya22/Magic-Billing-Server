export declare const validatedEnv: {
    NODE_ENV: "local" | "development" | "production";
    PORT: number;
    DATABASE_URL: string;
    JWT_ACCESS_TOKEN_SECRET: string;
    JWT_REFRESH_TOKEN_SECRET: string;
    JWT_ACCESS_EXPIRES_IN: string;
    JWT_REFRESH_EXPIRES_IN: string;
    STATIC_TOKEN: string;
    SALT_ROUNDS: string;
    SECRET_KEY: string;
    IV: string;
    BASE_URL?: string | undefined;
};
