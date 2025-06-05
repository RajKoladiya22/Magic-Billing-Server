// prisma/middleware/encryptUserBank.ts
import { Prisma } from "@prisma/client";
import { encrypt, decrypt } from "../../utils/crypto";

export const encryptUserBankMiddleware: Prisma.Middleware = async (params, next) => {
  if (params.model === "UserBank" && ["create", "update", "upsert"].includes(params.action)) {
    const fieldsToEncrypt = ["bankName", "accountNumber", "ifscCode", "branch", "accountType", "upiId"];
    for (const field of fieldsToEncrypt) {
      if (params.args.data[field]) {
        params.args.data[field] = encrypt(params.args.data[field]);
      }
    }
  }
  const result = await next(params);
  return result;
};
