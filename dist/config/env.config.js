"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envConfiguration = void 0;
const validate_env_1 = require("./validate-env");
const { NODE_ENV, PORT, DATABASE_URL, STATIC_TOKEN, SALT_ROUNDS, JWT_ACCESS_TOKEN_SECRET, JWT_REFRESH_TOKEN_SECRET, JWT_ACCESS_EXPIRES_IN, JWT_REFRESH_EXPIRES_IN, } = validate_env_1.validatedEnv;
const envConfiguration = () => ({
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
});
exports.envConfiguration = envConfiguration;
//# sourceMappingURL=env.config.js.map