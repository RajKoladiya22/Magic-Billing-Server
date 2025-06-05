"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserBankSchema = void 0;
const zod_1 = require("zod");
exports.createUserBankSchema = zod_1.z.object({
    bankName: zod_1.z.string().min(1),
    accountNumber: zod_1.z.string().min(6),
    ifscCode: zod_1.z.string().optional(),
    branch: zod_1.z.string().optional(),
    accountType: zod_1.z.string().optional(),
    openingBalance: zod_1.z.number().optional(),
    upiId: zod_1.z.string().optional(),
    notes: zod_1.z.array(zod_1.z.string()).optional(),
    isDefault: zod_1.z.boolean().optional()
});
//# sourceMappingURL=userBank.schema.js.map