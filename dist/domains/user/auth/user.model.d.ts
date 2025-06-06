import { PrismaClient, User as PrismaUser, OTP as PrismaOTP } from "@prisma/client";
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export type User = PrismaUser;
export type OTP = PrismaOTP;
