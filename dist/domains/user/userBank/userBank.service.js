"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserBankById = void 0;
exports.createUserBank = createUserBank;
exports.getUserBanks = getUserBanks;
exports.updateUserBank = updateUserBank;
exports.deleteUserBank = deleteUserBank;
const database_config_1 = require("../../../config/database.config");
const crypto_1 = require("../../../core/utils/crypto");
async function createUserBank(userId, data) {
    console.log("\n\n\n CHECK---->", (0, crypto_1.encrypt)(data.accountNumber));
    const encrypted = {
        ...data,
        accountNumber: (0, crypto_1.encrypt)(data.accountNumber),
        ifscCode: data.ifscCode ? (0, crypto_1.encrypt)(data.ifscCode) : undefined,
        upiId: data.upiId ? (0, crypto_1.encrypt)(data.upiId) : undefined,
    };
    console.log("\n\n\n encrypted--->", encrypted);
    return database_config_1.prisma.userBank.create({ data: { ...encrypted, userId } });
}
async function getUserBanks(userId) {
    const banks = await database_config_1.prisma.userBank.findMany({ where: { userId } });
    return banks.map(b => ({
        ...b,
        accountNumber: (0, crypto_1.decrypt)(b.accountNumber),
        ifscCode: b.ifscCode ? (0, crypto_1.decrypt)(b.ifscCode) : null,
        upiId: b.upiId ? (0, crypto_1.decrypt)(b.upiId) : null,
    }));
}
const getUserBankById = async (id, userId) => {
    const bank = await database_config_1.prisma.userBank.findFirst({ where: { id, userId } });
    if (!bank)
        throw new Error('Not found');
    return {
        ...bank,
        accountNumber: bank.accountNumber ? (0, crypto_1.decrypt)(bank.accountNumber) : '',
        ifscCode: bank.ifscCode ? (0, crypto_1.decrypt)(bank.ifscCode) : null,
        upiId: bank.upiId ? (0, crypto_1.decrypt)(bank.upiId) : null,
    };
};
exports.getUserBankById = getUserBankById;
async function updateUserBank(userId, id, data) {
    const bank = await database_config_1.prisma.userBank.findUnique({ where: { id } });
    if (!bank || bank.userId !== userId)
        throw new Error('Unauthorized');
    const encrypted = {
        ...data,
        accountNumber: data.accountNumber ? (0, crypto_1.encrypt)(data.accountNumber) : undefined,
        ifscCode: data.ifscCode ? (0, crypto_1.encrypt)(data.ifscCode) : undefined,
        upiId: data.upiId ? (0, crypto_1.encrypt)(data.upiId) : undefined,
    };
    return database_config_1.prisma.userBank.update({ where: { id }, data: encrypted });
}
async function deleteUserBank(userId, id) {
    const bank = await database_config_1.prisma.userBank.findUnique({ where: { id } });
    if (!bank || bank.userId !== userId)
        throw new Error('Unauthorized');
    return database_config_1.prisma.userBank.delete({ where: { id } });
}
//# sourceMappingURL=userBank.service.js.map