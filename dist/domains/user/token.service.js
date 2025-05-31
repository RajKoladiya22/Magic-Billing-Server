"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeRefreshToken = storeRefreshToken;
exports.findValidRefreshToken = findValidRefreshToken;
exports.revokeRefreshToken = revokeRefreshToken;
const user_model_1 = require("./user.model");
const dayjs_1 = __importDefault(require("dayjs"));
function parseExpiryString(expiry) {
    const match = expiry.match(/^(\d+)([smhd])$/);
    if (!match) {
        throw new Error("Invalid expiry format. Use '15m', '1h', '7d', etc.");
    }
    const value = parseInt(match[1], 10);
    const unitMap = {
        s: "second",
        m: "minute",
        h: "hour",
        d: "day",
    };
    const unit = unitMap[match[2]];
    return { value, unit };
}
async function storeRefreshToken(userId, token, expiresIn) {
    const { value, unit } = parseExpiryString(expiresIn);
    const expiryDate = (0, dayjs_1.default)().add(value, unit).toDate();
    return user_model_1.prisma.token.create({
        data: {
            userId,
            token,
            expiryDate,
            revoked: false,
        },
    });
}
async function findValidRefreshToken(token) {
    const record = await user_model_1.prisma.token.findFirst({
        where: {
            token,
            revoked: false,
            expiryDate: { gt: new Date() },
        },
    });
    return record;
}
async function revokeRefreshToken(token) {
    await user_model_1.prisma.token.updateMany({
        where: { token },
        data: { revoked: true },
    });
}
//# sourceMappingURL=token.service.js.map