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
export declare const envConfiguration: () => EnvConfig;
export {};
