import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import ms from "ms"; 

dotenv.config();

const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET!;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN! || "15m"; // e.g., "15m"
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN! || "1d"; // e.g., "1d"

/**
 * Generates a signed Access Token (short‐lived).
 * Payload contains: { id, role }
 */
export const generateAccessToken = (userId: string, role: string): string => {
  const options: SignOptions = {
    expiresIn: ACCESS_EXPIRES_IN as ms.StringValue,
    algorithm: "HS256",
  };
  return jwt.sign({ id: userId, role }, ACCESS_SECRET, options);
};

/**
 * Generates a signed Refresh Token (longer‐lived “reference token”).
 * Payload contains: { id, role }
 */
export const generateRefreshToken = (userId: string, role: string): string => {
  const options: SignOptions = {
    expiresIn: REFRESH_EXPIRES_IN as ms.StringValue,
    algorithm: "HS256",
  };
  return jwt.sign({ id: userId, role }, REFRESH_SECRET, options);
};

/**
 * Verifies an Access Token. Returns payload if valid, otherwise null.
 */
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, ACCESS_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};

/**
 * Verifies a Refresh Token. Returns payload if valid, otherwise null.
 */
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    return jwt.verify(token, REFRESH_SECRET) as JwtPayload;
  } catch {
    return null;
  }
};
