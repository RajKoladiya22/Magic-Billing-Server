"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
const toNumber = (val) => typeof val === 'string' && val.trim() !== '' && !isNaN(Number(val))
    ? Number(val)
    : undefined;
exports.envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['local', 'development', 'production']),
    PORT: zod_1.z.preprocess(toNumber, zod_1.z.number().default(3000)),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_ACCESS_TOKEN_SECRET: zod_1.z.string(),
    JWT_REFRESH_TOKEN_SECRET: zod_1.z.string(),
    JWT_ACCESS_EXPIRES_IN: zod_1.z.string(),
    JWT_REFRESH_EXPIRES_IN: zod_1.z.string(),
    STATIC_TOKEN: zod_1.z.string(),
    SALT_ROUNDS: zod_1.z.string()
});
//# sourceMappingURL=env.validation.js.map