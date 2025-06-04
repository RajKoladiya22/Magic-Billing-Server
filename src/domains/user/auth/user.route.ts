// src/domains/user/user.router.ts

import express from "express";
import {
  sendOtpHandler,
  verifyOtpHandler,
  signupHandler,
  signinHandler,
  refreshAccessTokenHandler,
} from "./user.controller";
import { RequestHandler } from "express";
import { authenticateUser } from "../../../core/middleware/jwt";

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

export default router;
