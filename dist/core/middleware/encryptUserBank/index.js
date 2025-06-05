"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptUserBankMiddleware = void 0;
const crypto_1 = require("../../utils/crypto");
const encryptUserBankMiddleware = async (params, next) => {
    if (params.model === "UserBank" && ["create", "update", "upsert"].includes(params.action)) {
        const fieldsToEncrypt = ["bankName", "accountNumber", "ifscCode", "branch", "accountType", "upiId"];
        for (const field of fieldsToEncrypt) {
            if (params.args.data[field]) {
                params.args.data[field] = (0, crypto_1.encrypt)(params.args.data[field]);
            }
        }
    }
    const result = await next(params);
    return result;
};
exports.encryptUserBankMiddleware = encryptUserBankMiddleware;
//# sourceMappingURL=index.js.map