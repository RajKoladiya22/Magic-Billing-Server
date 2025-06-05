"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decrypt = exports.encrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = 'aes-256-cbc';
const secret = process.env.SECRET_KEY || 'e86f449a48e5f1cbedae6a6fc6c92902';
const iv = Buffer.from(process.env.IV) || 'e86f449a48e5f1cb';
const encrypt = (text) => {
    const cipher = crypto_1.default.createCipheriv(algorithm, Buffer.from(secret), iv);
    let encrypted = cipher.update(text, 'utf-8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
};
exports.encrypt = encrypt;
const decrypt = (encrypted) => {
    const decipher = crypto_1.default.createDecipheriv(algorithm, Buffer.from(secret), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');
    return decrypted;
};
exports.decrypt = decrypt;
//# sourceMappingURL=index.js.map