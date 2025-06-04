import { Token as PrismaToken } from "@prisma/client";
export declare const storeRefreshToken: (userId: string, token: string, expiresIn: string) => Promise<PrismaToken>;
export declare const revokeRefreshToken: (token: string) => Promise<void>;
