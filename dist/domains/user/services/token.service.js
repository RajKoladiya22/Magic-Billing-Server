"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.revokeRefreshToken = exports.findValidRefreshToken = exports.storeRefreshToken = void 0;
const user_model_1 = require("../user.model");
const dayjs_1 = __importDefault(require("dayjs"));
const parseExpiryString = (expiry) => {
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
};
const storeRefreshToken = async (userId, token, expiresIn) => {
    const existingToken = await user_model_1.prisma.token.findUnique({
        where: { userId },
    });
    if (existingToken) {
        console.log(`Refresh token already exists for user ${userId}, using existing token.`);
        return existingToken;
    }
    const { value, unit } = parseExpiryString(expiresIn);
    const expiryDate = (0, dayjs_1.default)().add(value, unit).toDate();
    console.log(`Storing refresh token for user ${userId} with expiry ${expiryDate}`);
    return user_model_1.prisma.token.create({
        data: {
            userId,
            token,
            expiryDate,
            revoked: false,
        },
    });
};
exports.storeRefreshToken = storeRefreshToken;
const findValidRefreshToken = async (token) => {
    const record = await user_model_1.prisma.token.findFirst({
        where: {
            token,
            revoked: false,
            expiryDate: { gt: new Date() },
        },
    });
    return record;
};
exports.findValidRefreshToken = findValidRefreshToken;
const revokeRefreshToken = async (token) => {
    await user_model_1.prisma.token.updateMany({
        where: { token },
        data: { revoked: true },
    });
};
exports.revokeRefreshToken = revokeRefreshToken;
//# sourceMappingURL=token.service.js.map