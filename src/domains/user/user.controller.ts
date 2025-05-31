// src/domains/user/user.controller.ts

import { Request, Response, NextFunction } from "express";
import {
  sendOtp,
  verifyOtp,
  signupUser,
  signinUser,
} from "./services/user.service";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../core/utils/httpResponse";
import dotenv from "dotenv";

// Import new JWT utilities:
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../../core/middleware/jwt";

// Import the Token service to persist / validate refresh‐tokens:
import {
  storeRefreshToken,
  findValidRefreshToken,
} from "./services/token.service";
import { setRefreshTokenCookie } from "../../core/middleware/cookie";
import { SendOtpRequestBody, SigninRequestBody, SignupRequestBody, VerifyOtpRequestBody } from "../../interfaces/auth.interfaces";

dotenv.config();

const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN!; // e.g. "7d"



/**
 * POST /auth/send-otp
 * Body: { email }
 */
export const sendOtpHandler = async (
  req: Request<{}, {}, SendOtpRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;
    if (!email) {
      sendErrorResponse(res, 400, "Email is required.");
      return;
    }

    await sendOtp(email);
    sendSuccessResponse(res, 200, "OTP sent successfully.", {});
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Failed to send OTP.");
  }
};

/**
 * POST /auth/verify-otp
 * Body: { email, code }
 */
export const verifyOtpHandler = async (
  req:  Request<{}, {}, VerifyOtpRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      sendErrorResponse(res, 400, "Email and code are required.");
      return;
    }

    await verifyOtp(email, code);
    sendSuccessResponse(res, 200, "OTP verified successfully.", {});
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "OTP verification failed.");
  }
};

/**
 * POST /auth/signup
 * Body: { firstName, lastName, email, password }
 * Precondition: OTP must have been verified already.
 */
export const signupHandler = async (
  req: Request<{}, {}, SignupRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    if (!firstName || !lastName || !email || !password) {
      sendErrorResponse(res, 400, "All fields are required.");
      return;
    }

    // Create user (business logic in user.service)
    const user = await signupUser({ firstName, lastName, email, password });

    // Generate tokens
    const accessToken = generateAccessToken(user.id, "user");
    const refreshToken = generateRefreshToken(user.id, "user");

    // Persist the refresh‐token in DB (Token table)
    await storeRefreshToken(user.id, refreshToken, REFRESH_EXPIRES_IN);

    // Set the refresh‐token cookie
    setRefreshTokenCookie(res, accessToken);

    // Return the access token in JSON
    sendSuccessResponse(res, 201, "User registered successfully.", {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      tokens: {
        accessToken,
      },
    });
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Signup failed.");
  }
};

/**
 * POST /auth/signin
 * Body: { email, password }
 */
export const signinHandler = async (
  req: Request<{}, {}, SigninRequestBody>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      sendErrorResponse(res, 400, "Email and password are required.");
      return;
    }

    // Authenticate user (business logic in user.service)
    const user = await signinUser({ email, password });
    if (!user) {
      sendErrorResponse(res, 401, "Invalid email or password.");
      return;
    }
    // console.log("User signed in:", user);

    // Generate tokens
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

    // console.log("Generated tokens:", refreshToken);
    // console.log("REFRESH_EXPIRES_IN:", REFRESH_EXPIRES_IN);
    

    // Persist the refresh‐token in DB
    await storeRefreshToken(user.id, refreshToken, REFRESH_EXPIRES_IN);

    // Set cookie
    setRefreshTokenCookie(res, accessToken);

    sendSuccessResponse(res, 200, "Signed in successfully.", {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
      tokens: {
        accessToken,
      },
    });
  } catch (err: any) {
    sendErrorResponse(res, 401, err.message || "Signin failed.");
  }
};

/**
 * POST /auth/refresh-token
 * - Reads refresh‐token from either HttpOnly cookie or Authorization header
 * - Verifies signature + DB lookup (not revoked + not expired)
 * - Issues a new Access Token
 */
export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // 1. Extract refresh‐token from cookie or header
    let refreshToken = req.cookies?.rJmkUxzNakU;
    if (!refreshToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        refreshToken = authHeader.split(" ")[1];
      }
    }

    if (!refreshToken) {
      sendErrorResponse(res, 401, "Refresh token missing.");
      return;
    }

    // 2. Verify JWT signature & decode payload
    const payload = verifyRefreshToken(refreshToken);
    if (!payload?.id || !payload.role) {
      sendErrorResponse(res, 401, "Invalid or malformed refresh token.");
      return;
    }

    // 3. Check DB that the token exists, is not revoked, and not expired
    const stored = await findValidRefreshToken(refreshToken);
    if (!stored) {
      sendErrorResponse(res, 401, "Refresh token invalid or expired.");
      return;
    }

    // 4. Issue a brand‐new access‐token (we do NOT rotate the refresh token)
    const newAccessToken = generateAccessToken(payload.id, payload.role);

    sendSuccessResponse(res, 200, "Access token refreshed.", {
      accessToken: newAccessToken,
    });
  } catch (err: any) {
    sendErrorResponse(res, 401, err.message || "Failed to refresh access token.");
  }
};
