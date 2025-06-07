// src/domains/user/user.controller.ts

import { Request, Response, NextFunction } from "express";
import {
  sendOtp,
  verifyOtp,
  signupUser,
  signinUser,
} from "../services/user.service";
import {
  sendSuccessResponse,
  sendErrorResponse,
} from "../../../../core/utils/httpResponse";
import dotenv from "dotenv";

// Import new JWT utilities:
import {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../../../core/middleware/jwt";

import {
  forgotPassword,
  resetPassword,
  changePassword,
} from "../services/passwordReset.service";

// Import the Token service to persist / validate refresh‐tokens:
import {
  findValidRefreshToken,
  storeRefreshToken,
  // findValidRefreshToken,
} from "../services/token.service";
import { setRefreshTokenCookie } from "../../../../core/middleware/cookie";
import {
  SendOtpRequestBody,
  SigninRequestBody,
  SignupRequestBody,
  VerifyOtpRequestBody,
} from "../../../../interfaces/auth.interfaces";
import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";

dotenv.config();

const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN! || "1h"; // e.g. "7d"
const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET! || "10m"; 

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
  req: Request<{}, {}, VerifyOtpRequestBody>,
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
    const accessToken = generateAccessToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id, user.role);

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
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
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
    if (!email) {
      sendErrorResponse(res, 400, "Email is required.");
      return;
    }
    if (!password) {
      sendErrorResponse(res, 400, "Password is required.");
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

    // console.log("accessToken tokens:", accessToken);
    // console.log("refreshToken tokens:", refreshToken);
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
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        role: user.role,
        isActive: user.isActive,
        isVerified: user.isVerified,
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
    let accessToken = req.cookies?.rJmkAxzNakU;
    // console.log("\n\n\ accessToken --->", accessToken );
    if (!accessToken) {
      const authHeader = req.headers.authorization;
      if (authHeader?.startsWith("Bearer ")) {
        accessToken = authHeader.split(" ")[1];
      }
    }

    if (!accessToken) {
      sendErrorResponse(res, 401, "Access token missing.");
      return;
    }

    let payload: JwtPayload | null = null;
    try {
      payload = jwt.verify(accessToken, ACCESS_SECRET, {
        algorithms: ["HS256"],
      }) as JwtPayload;
      // console.log("\n\n\n\n payload--->", payload);
    } catch (err: any) {
      if (err instanceof TokenExpiredError) {
        payload = jwt.decode(accessToken) as JwtPayload;
      } else {
        sendErrorResponse(res, 401, "Invalid access token.");
        return;
      }
    }

    if (!payload?.id || !payload.role) {
      sendErrorResponse(res, 401, "Invalid or malformed refresh token.");
      return;
    }

    // 3. Check DB that the token exists, is not revoked, and not expired
    const stored = await findValidRefreshToken(payload?.id);
    // console.log("\n\n\n\n stored--->", stored);
    if (!stored) {
      sendErrorResponse(res, 401, "Refresh token invalid or expired.");
      return;
    }

    // 4. Issue a brand‐new access‐token (we do NOT rotate the refresh token)
    const newAccessToken = generateAccessToken(payload.id, payload.role);

    // Set cookie
    setRefreshTokenCookie(res, newAccessToken);

    sendSuccessResponse(res, 200, "Access token refreshed.", {
      tokens: {
        accessToken: newAccessToken,
      },
    });
  } catch (err: any) {
    console.log("Error in refreshAccessTokenHandler:", err);
    sendErrorResponse(
      res,
      401,
      err.message || "Failed to refresh access token."
    );
  }
};



/**
 * POST /auth/forgot-password
 * Body: { email }
 * Initiates a password reset by emailing the user a one-time token
 */
export const forgotPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      sendErrorResponse(res, 400, "Email is required.");
      return;
    }
    await forgotPassword(email);
    sendSuccessResponse(res, 200, "Password reset email sent.", {});
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Failed to initiate password reset.");
  }
};


/**
 * POST /auth/reset-password
 * Body: { userId, token, newPassword }
 * Completes the reset flow by verifying token and updating password
 */
export const resetPasswordHandler = async (req: Request, res: Response) => {
  try {
    const { userId, token, newPassword } = req.body;
    // console.log("Reset password request:", { userId, token, newPassword });
    if (!userId || !token || !newPassword) {
      sendErrorResponse(res, 400, "userId, token, and newPassword are required.");
      return
    }
    await resetPassword(userId, token, newPassword);
    sendSuccessResponse(res, 200, "Password has been reset successfully.", {});
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Failed to reset password.");
  }
};

/**
 * POST /auth/change-password
 * Protected route; user must be authenticated (req.user.id)
 * Body: { oldPassword, newPassword }
 * Updates password after verifying old password
 */
export const changePasswordHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    const { oldPassword, newPassword } = req.body;
    if (!userId) {
      sendErrorResponse(res, 401, "Unauthorized");
      return
    }
    if (!oldPassword || !newPassword) {
      sendErrorResponse(res, 400, "oldPassword and newPassword are required.");
      return
    }
    await changePassword(userId, oldPassword, newPassword);

    sendSuccessResponse(res, 200, "Password changed successfully.", {});
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Failed to change password.");
  }
};

