// src/domains/user/user.router.ts

import express from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  signupHandler,
  signinHandler,
  refreshAccessTokenHandler,
  forgotPasswordHandler,
  resetPasswordHandler,
  changePasswordHandler
} from "./controller/user.controller";
import { authenticateUser } from "../../../core/middleware/jwt";
import { processResetPasswordForm, renderResetPasswordForm } from "./controller/passwordResetView.controller";

const router = express.Router();

router.get("/check", (req, res, next) => {
  res.status(200).json({ message: "Check endpoint is working!" });
});

// 1. Send OTP to user’s email
//    POST /auth/send-otp

router.post("/send-otp", authenticateUser, sendOtpHandler);

// 2. Verify OTP
//    POST /auth/verify-otp
router.post("/verify-otp", authenticateUser, verifyOtpHandler);

// 3. Signup (after successful OTP verification)
//    POST /auth/signup
router.post("/signup", signupHandler);

// 4. Signin
//    POST /auth/signin
router.post("/signin", signinHandler);

// Refresh Access Token
router.post("/refresh-token", refreshAccessTokenHandler);


/**
 * Public endpoint to request a password reset email.
 * POST /auth/forgot-password
 */
router.post("/forgot-password", forgotPasswordHandler);

/**
 * Public endpoint to reset password using token.
 * POST /auth/reset-password
 */
router.post("/reset-password-json", resetPasswordHandler);

/**
 * Protected endpoint to change password with old password.
 * POST /auth/change-password
 */
router.post("/change-password", authenticateUser, changePasswordHandler);


router.post("/reset-password", processResetPasswordForm); 

router.get("/reset-password", renderResetPasswordForm);

export default router;
