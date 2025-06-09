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
} from "../../../../interfaces/auth.interfaces";

dotenv.config();

const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);
const OTP_EXPIRATION_MINUTES = 10;
const OTP_COOLDOWN_SECONDS = 45;

// ────── EMAIL TRANSPORTER ──────────────────────────────────────────────────────
// Assumes these env vars exist: MAIL_HOST, MAIL_USER, MAIL_PASS

const transporter = nodemailer.createTransport({
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

  const emailHtml = `
  <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Magic Billing</title>
    <style>
        /* Reset styles */
        body, html {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background-color: #f7f9fc;
            color: #333333;
            line-height: 1.6;
        }
        
        /* Main container */
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }
        
        /* Header section */
        .header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            padding: 30px 20px;
            text-align: center;
            color: white;
        }
        
        .logo {
            font-size: 24px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        
        /* Content section */
        .content {
            padding: 40px 30px;
        }
        
        .heading {
            font-size: 24px;
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 20px;
        }
        
        .text {
            font-size: 16px;
            color: #4a5568;
            margin-bottom: 10px;
        }
        
        .highlight {
            font-weight: 600;
            color: #2d3748;
        }
        
        /* OTP container */
        .otp-container {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 30px 0;
            gap: 10px;
        }
        
        .otp-code {
            font-size: 32px;
            font-weight: 700;
            letter-spacing: 8px;
            background: #f0f7ff;
            color: #2c5282;
            padding: 20px 25px;
            border-radius: 10px;
            border: 1px dashed #c3dafe;
        }
        
        .copy-btn {
            background: #ebf4ff;
            border: none;
            border-radius: 8px;
            padding: 15px;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        
        .copy-btn:hover {
            background: #d6e6ff;
        }
        
        .copy-icon {
            width: 24px;
            height: 24px;
            display: block;
        }
        
        /* Footer */
        .footer {
            text-align: center;
            padding: 25px 20px;
            background: #f8fafc;
            color: #718096;
            font-size: 14px;
            border-top: 1px solid #edf2f7;
        }
        
        .warning {
            background: #fffaf0;
            border-left: 4px solid #ecc94b;
            padding: 15px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        
        .expiration {
            display: inline-block;
            background: #fff7f6;
            color: #e53e3e;
            padding: 8px 15px;
            border-radius: 6px;
            font-weight: 600;
            margin: 10px 0;
        }
        .system-note {
            background: #f7fafc;
            border: 1px dashed #cbd5e0;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            margin-top: 20px;
            font-size: 13px;
            color: #718096;
        }
        .footer-links {
            display: flex;
            flex-wrap: wrap;
            justify-content: center;
            gap: 25px;
            margin: 20px 0;
        }
        
        .footer-links a {
            color: #4a5568;
            text-decoration: none;
            transition: color 0.3s;
        }
        
        .footer-links a:hover {
            color: #2b6cb0;
        }

        /* Responsive styles */
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .otp-code {
                font-size: 24px;
                padding: 15px 20px;
                letter-spacing: 6px;
            }
            
            .heading {
                font-size: 22px;
            }
            .footer-links {
                flex-direction: column;
                align-items: center;
                gap: 15px;
            }
        }
    </style>
</head>
<body>
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
            <td align="center" style="padding: 30px 15px;">
                <!-- Main container -->
                <table class="container" cellpadding="0" cellspacing="0" role="presentation">
                    <!-- Header -->
                    <tr>
                        <td class="header">
                            <div class="logo">Magic Billing</div>
                            <h1 style="margin: 20px 0 0; font-size: 28px;">Verify Your Email Address</h1>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td class="content">
                            <p class="text">Hello,</p>
                            <p class="text">Thank you for choosing Magic Billing. To complete your email verification, please use the following One-Time Password (OTP):</p>
                            
                            <!-- OTP Container -->
                            <div class="otp-container">
                                <div class="otp-code" id="otpCode">${code}</div>
                                
                            </div>
                            
                            <div class="expiration">
                                ⏳ Expires in ${OTP_EXPIRATION_MINUTES} minutes
                            </div>
                            
                            <div class="warning">
                                <strong>Security tip:</strong> Never share this code with anyone. Magic Billing will never ask for your OTP.
                            </div>
                            
                            <p class="text">If you didn't request this email, you can safely ignore it.</p>
                            <p class="text highlight">Need help? Contact our support team at support@magicbilling.com</p>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td class="footer">
                            <p>© ${new Date().getFullYear()} Magic Billing. All rights reserved.</p>
                           
                            <p style="margin-top: 8px; color: #a0aec0;">
                                Magic Billing Inc.<br>
                                214/215 Shoham Arc,<br>
                                Surat, GJ 395005
                            </p>
                            <div class="system-note">
                <i class="fas fa-exclamation-circle"></i> This is an automated system-generated message. Please do not reply to this email.
            </div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
  </body>
  </html>
    `

  // 4. Send email via Nodemailer
  const mailOptions = {
    from: process.env.MAIL_USER,
    to: email,
    subject: "Your One‐Time Verification Code",
    html: emailHtml,
    // text: `Your OTP code is: ${ code }. It will expire in ${ OTP_EXPIRATION_MINUTES } minutes.`,
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
  console.log("signinUser called with email:", email);
  console.log("signinUser called with password:", password);
  // 1. Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      createdAt: true,
      updatedAt: true,
      role: true,       // Default role, can be ADMIN, USER, etc.
      isActive: true,   // Soft delete flag
      isVerified: true, // Email verification status
    },
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
    throw new Error("Invalid Password.");
  }

  return user;
};
