import { Token as PrismaToken } from "@prisma/client";
export declare function storeRefreshToken(userId: string, token: string, expiresIn: string): Promise<PrismaToken>;
export declare function findValidRefreshToken(token: string): Promise<PrismaToken | null>;
export declare function revokeRefreshToken(token: string): Promise<void>;
