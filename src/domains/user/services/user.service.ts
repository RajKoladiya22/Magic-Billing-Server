// src/domains/user/service/user.service.ts

import { prisma, OTP, User } from "../user.model";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import dayjs from "dayjs";
import {
  IUser,
  SignupInput,
  SigninInput,
} from "../../../interfaces/auth.interfaces";

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);
const OTP_EXPIRATION_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 45;

// ────── EMAIL TRANSPORTER ──────────────────────────────────────────────────────
// Assumes these env vars exist: MAIL_HOST, MAIL_USER, MAIL_PASS
const transporter = nodemailer.createTransport({
  // host: process.env.MAIL_HOST,
  // port: 587,
  // secure: false, // upgrade later with STARTTLS
  // auth: {
  //   user: process.env.MAIL_USER,
  //   pass: process.env.MAIL_PASS,
  // },
  service: "gmail",
  auth: {
    user: process.env.MAIL_USER || "magicallydev@gmail.com",
    pass: process.env.MAIL_PASS || "erot xrlh avwe bwqi",
  },
});

/**
 * Generate a random 6‐digit numeric OTP code.
 */
const generateSixDigitCode = (): string => {
  return Math.floor(100_000 + Math.random() * 900_000).toString();
};

/**
 * sendOtp: Generate & send a 6‐digit code to the given email.
 *   - Enforces a 45‐second cooldown per email (via the most recent OTP record).
 *   - Stores OTP in the OTP table (expires in 10 min, single‐use).
 */
export const sendOtp = async (email: string): Promise<void> => {
  // 1. Check for cooldown: find the latest unused OTP for this email
  const recent = await prisma.oTP.findFirst({
    where: {
      email,
      used: false,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (recent) {
    const secondsSince = dayjs().diff(dayjs(recent.createdAt), "second");
    if (secondsSince < OTP_COOLDOWN_SECONDS) {
      const wait = OTP_COOLDOWN_SECONDS - secondsSince;
      throw new Error(`Please wait ${wait}s before requesting a new OTP.`);
    }
  }

  // 2. Generate a fresh 6‐digit code
  const code = generateSixDigitCode();
  const expiresAt = dayjs().add(OTP_EXPIRATION_MINUTES, "minute").toDate();

  // 3. Save in DB
  await prisma.oTP.create({
    data: {
      email,
      code,
      expiresAt,
      used: false,
    },
  });

  // 4. Send email via Nodemailer
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Your One‐Time Verification Code",
    text: `Your OTP code is: ${code}. It will expire in ${OTP_EXPIRATION_MINUTES} minutes.`,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * verifyOtp: Given email + code, verify that:
 *   - code matches a non‐used OTP for this email,
 *   - not expired,
 *   - then mark it used.
 */
export const verifyOtp = async (email: string, code: string): Promise<void> => {
  // 1. Find a matching OTP that is not already used
  const otpRecord = await prisma.oTP.findFirst({
    where: {
      email,
      code,
      used: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired OTP.");
  }

  // 2. Mark OTP as used
  await prisma.oTP.update({
    where: { id: otpRecord.id },
    data: { used: true },
  });

  // 3. Mark corresponding user as verified (if they exist)
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    });
  }
};

/**
 * signupUser: After OTP verified, create a new User.
 *   - Checks email uniqueness
 *   - Hashes password
 */

export const signupUser = async (input: SignupInput): Promise<IUser> => {
  const { firstName, lastName, email, password } = input;
  // 1. Check if email is already registered
  const existing = await prisma.user.findUnique({
    where: { email },
  });
  if (existing) {
    throw new Error("Email is already registered.");
  }

  // 2. Hash password
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashed = await bcrypt.hash(password, salt);

  // 3. Create user with isVerified = false, isActive = true by default
  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      password: hashed,
      isVerified: false,
      isActive: true,
      role: "USER", // default role
    },
  });

  return user as IUser;
};

/**
 * signinUser: Check email/password, return the User if valid.
 */

export const signinUser = async (input: SigninInput): Promise<User> => {
  const { email, password } = input;
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  // 2. Ensure the user’s account is active and verified
  // if (!user.isVerified) {
  //   throw new Error("Please verify your email before signing in.");
  // }
  if (!user.isActive) {
    throw new Error("This account has been deactivated.");
  }

  // 3. Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password.");
  }

  return user;
};
