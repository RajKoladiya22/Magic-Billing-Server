"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startCleanupJobWithTimeout = exports.cleanupExpiredTokensAndOtps = void 0;
const database_config_1 = require("../../config/database.config");
const dayjs_1 = __importDefault(require("dayjs"));
console.log("[INIT] Cleanup job scheduled in every 14 minutes.");
const cleanupExpiredTokensAndOtps = async () => {
    const now = new Date();
    const before = (0, dayjs_1.default)().subtract(1, "day").toDate();
    const [deletedTokens, deletedOtps, deletedReset] = await Promise.all([
        database_config_1.prisma.token.deleteMany({
            where: {
                OR: [
                    { expiryDate: { lt: now } },
                    { revoked: true },
                ],
            },
        }),
        database_config_1.prisma.oTP.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: now } },
                    { used: true, createdAt: { lt: before } },
                    { used: true, }
                ],
            },
        }),
        database_config_1.prisma.passwordReset.deleteMany({
            where: {
                OR: [
                    { expiresAt: { lt: now } },
                    { used: true, createdAt: { lt: before } },
                    { used: true, }
                ],
            },
        }),
    ]);
    console.log(`[CLEANUP] Removed ${deletedTokens.count} expired tokens.`);
    console.log(`[CLEANUP] Removed ${deletedOtps.count} used/expired OTPs.`);
    console.log(`[CLEANUP] Removed ${deletedReset.count} used/expired Reset token.`);
};
exports.cleanupExpiredTokensAndOtps = cleanupExpiredTokensAndOtps;
const startCleanupJobWithTimeout = () => {
    const INTERVAL_MS = 10 * 60 * 1000;
    const runner = async () => {
        console.log("[CLEANUP] Running cleanup via recursive setTimeout…");
        try {
            await (0, exports.cleanupExpiredTokensAndOtps)();
        }
        catch (err) {
            console.error("[CLEANUP] Error:", err);
        }
        setTimeout(runner, INTERVAL_MS);
    };
    setTimeout(runner, INTERVAL_MS);
};
exports.startCleanupJobWithTimeout = startCleanupJobWithTimeout;
//# sourceMappingURL=index.js.map