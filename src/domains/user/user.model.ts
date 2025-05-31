import { PrismaClient, User as PrismaUser, OTP as PrismaOTP } from "@prisma/client";

export const prisma = new PrismaClient();

// You can (optionally) re‐export User & OTP types for convenience:
export type User = PrismaUser;
export type OTP  = PrismaOTP;