import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import dotenv from "dotenv";
import ms from "ms";
import { sendErrorResponse } from "../../utils/httpResponse";
import { AuthenticatedRequest } from "../../../interfaces/auth.interfaces";

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

export const authenticateUser = (
  req: Request & AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token: string | undefined;
    token = req.cookies?.rJmkAxzNakU;

    // 2. Fallback to cookie
    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      sendErrorResponse(res, 401, "Authentication token missing");
      return;
    }

    const decoded = jwt.verify(token, ACCESS_SECRET, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    // console.log("decoded--->", decoded);

    if (
      !decoded ||
      typeof decoded !== "object" ||
      !decoded.id ||
      !decoded.role
    ) {
      sendErrorResponse(res, 401, "Invalid token payload");
      return;
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
    };

    next();
  } catch (err: any) {
    console.log("err.name---->", err.name);
    console.log("\n\nerr---->", err);

    if (err.name === "TokenExpiredError") {
      res.clearCookie("rJmkAxzNakU", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });
      sendErrorResponse(res, 401, "Token expired");
      return;
    }
    // console.error("JWT verification error:", err);
    sendErrorResponse(res, 401, "Unauthorized access");
    return;
  }
};


export const  authorizeRoles =
  (...allowedRoles: string[]) =>
  (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const role = req.user?.role;
    // console.log("role-->", role);

    if (!role || !allowedRoles.includes(role)) {
      sendErrorResponse(res, 403, "Forbidden:You Don't have Permission");
      return;
    }

    next();
  };