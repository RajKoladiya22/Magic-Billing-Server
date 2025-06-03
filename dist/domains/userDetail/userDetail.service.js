"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDetail = exports.getUserDetail = exports.upsertUserDetail = void 0;
const database_config_1 = require("../../config/database.config");
const upsertUserDetail = async (userId, data) => {
    const userDetail = await database_config_1.prisma.userDetail.upsert({
        where: { userId },
        update: data,
        create: { ...data, userId },
    });
    return userDetail;
};
exports.upsertUserDetail = upsertUserDetail;
const getUserDetail = async (userId) => {
    return await database_config_1.prisma.userDetail.findUnique({ where: { userId } });
};
exports.getUserDetail = getUserDetail;
const updateUserDetail = async (userId, data) => {
    return await database_config_1.prisma.userDetail.update({
        where: { userId },
        data,
    });
};
exports.updateUserDetail = updateUserDetail;
//# sourceMappingURL=userDetail.service.js.map