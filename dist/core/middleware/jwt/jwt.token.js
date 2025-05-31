"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "1d";
const generateAccessToken = (userId, role) => {
    const options = {
        expiresIn: ACCESS_EXPIRES_IN,
        algorithm: "HS256",
    };
    return jsonwebtoken_1.default.sign({ id: userId, role }, ACCESS_SECRET, options);
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, role) => {
    const options = {
        expiresIn: REFRESH_EXPIRES_IN,
        algorithm: "HS256",
    };
    return jsonwebtoken_1.default.sign({ id: userId, role }, REFRESH_SECRET, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
//# sourceMappingURL=jwt.token.js.map