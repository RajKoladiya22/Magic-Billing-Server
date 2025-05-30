// auth.middleware.ts
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
import { sendErrorResponse } from "@core/utils/httpResponse";

// Load env variables
dotenv.config();

const _secretAccess = process.env.JWT_ACCESS_TOKEN_SECRET!;
const _secretRefresh = process.env.JWT_REFRESH_TOKEN_SECRET!;
const _expiresAccess = process.env.JWT_ACCESS_EXPIRES_IN || "1d";
const _expiresRefresh = process.env.JWT_REFRESH_EXPIRES_IN || "7d";

// Add typing for `req.user`
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
        adminId?: string;
      };
    }
  }
}

// 🔒 Middleware: Authenticate JWT Token
export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    let token = req.cookies?.rJmkUxzNakU;

    if (!token) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      }
    }

    if (!token) {
      sendErrorResponse(res, 401, "Authentication token missing");
      return;
    }

    const decoded = jwt.verify(token, _secretRefresh, {
      algorithms: ["HS256"],
    }) as JwtPayload;

    if (!decoded?.id || !decoded.role) {
      sendErrorResponse(res, 401, "Invalid token payload");
      return;
    }

    req.user = {
      id: decoded.id,
      role: decoded.role,
      adminId: decoded.adminId,
    };

    next();
  } catch (err: any) {
    console.error("JWT Error:", err.name, err.message);

    if (err.name === "TokenExpiredError") {
      clearAuthCookie(res);
      sendErrorResponse(res, 401, "Token expired");
      return;
    }

    sendErrorResponse(res, 401, "Unauthorized access");
  }
};

// 🔐 Middleware: Role-based Authorization
export const authorizeRoles =
  (...allowedRoles: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const role = req.user?.role;

    if (!role || !allowedRoles.includes(role)) {
      sendErrorResponse(res, 403, "Forbidden: You don't have permission");
      return;
    }

    next();
  };

// JWT Access Token Generator
export const generateAccessToken = (
  userId: string,
  role: string,
  adminId?: string
): string => {
  const payload = { id: userId, role, ...(adminId && { adminId }) };
  return jwt.sign(payload, _secretAccess, {
    expiresIn: _expiresAccess,
    algorithm: "HS256",
  });
};

// JWT Refresh Token Generator
export const generateRefreshToken = (
  userId: string,
  role: string,
  adminId?: string
): string => {
  const payload = { id: userId, role, ...(adminId && { adminId }) };
  return jwt.sign(payload, _secretRefresh, {
    expiresIn: _expiresRefresh,
    algorithm: "HS256",
  });
};

// Cookie Utility Functions
export const setAuthCookie = (res: Response, token: string): void => {
  res.cookie("rJmkUxzNakU", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const clearAuthCookie = (res: Response): void => {
  res.clearCookie("rJmkUxzNakU", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
};

export const getAuthCookie = (req: Request): string | undefined => req.cookies?.rJmkUxzNakU;

export const isAuthCookiePresent = (req: Request): boolean => !!getAuthCookie(req);

// ✨ Advanced Utilities (custom names/options)

export const setCustomAuthCookieWithOptions = (
  res: Response,
  token: string,
  options: {
    name?: string;
    httpOnly?: boolean;
    secure?: boolean;
    sameSite?: "strict" | "lax" | "none";
    maxAge?: number;
    path?: string;
  } = {}
): void => {
  const {
    name = "rJmkUxzNakU",
    httpOnly = true,
    secure = process.env.NODE_ENV === "production",
    sameSite = "strict",
    maxAge = 24 * 60 * 60 * 1000,
    path = "/",
  } = options;

  res.cookie(name, token, { httpOnly, secure, sameSite, maxAge, path });
};

export const validateCustomAuthCookie = (
  req: Request,
  options: { name?: string } = {}
): boolean => {
  const { name = "rJmkUxzNakU" } = options;
  const token = req.cookies?.[name];

  if (!token) return false;

  try {
    jwt.verify(token, _secretAccess, { algorithms: ["HS256"] });
    return true;
  } catch (err) {
    console.error("JWT Validation Error:", err);
    return false;
  }
};

export const extractUserFromCustomCookie = (
  req: Request,
  options: { name?: string } = {}
): { id: string; role: string; adminId?: string } | null => {
  const { name = "rJmkUxzNakU" } = options;
  const token = req.cookies?.[name];
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, _secretAccess) as JwtPayload;
    if (decoded?.id && decoded.role) {
      return {
        id: decoded.id,
        role: decoded.role,
        adminId: decoded.adminId,
      };
    }
    return null;
  } catch (err) {
    console.error("JWT Extraction Error:", err);
    return null;
  }
};
