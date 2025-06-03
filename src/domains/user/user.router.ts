// src/domains/user/user.router.ts

import express from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  signupHandler,
  signinHandler,
  refreshAccessTokenHandler,
} from "./user.controller";
import { authenticateUser } from "../../core/middleware/jwt";
import { RequestHandler } from "express";

const router = express.Router();

router.get("/check", (req, res, next) => {
  res.status(200).json({ message: "Check endpoint is working!" });
});

// 1. Send OTP to user’s email
//    POST /auth/send-otp

router.post("/send-otp", authenticateUser as RequestHandler, sendOtpHandler);

// 2. Verify OTP
//    POST /auth/verify-otp
router.post(
  "/verify-otp",
  authenticateUser as RequestHandler,
  verifyOtpHandler
);

// 3. Signup (after successful OTP verification)
//    POST /auth/signup
router.post("/signup", signupHandler);

// 4. Signin
//    POST /auth/signin
router.post("/signin", signinHandler);

// Refresh Access Token
router.post(
  "/refresh-token",
  authenticateUser as RequestHandler,
  refreshAccessTokenHandler
);

export default router;
