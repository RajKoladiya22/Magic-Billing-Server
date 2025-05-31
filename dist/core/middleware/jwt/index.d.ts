import { JwtPayload } from "jsonwebtoken";
export declare const generateAccessToken: (userId: string, role: string) => string;
export declare const generateRefreshToken: (userId: string, role: string) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload | null;
export declare const verifyRefreshToken: (token: string) => JwtPayload | null;
