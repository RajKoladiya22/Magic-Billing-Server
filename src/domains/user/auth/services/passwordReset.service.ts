// src/domains/user/services/passwordReset.service.ts

import crypto from "crypto";                            // Node.js crypto for random bytes and hashing
import bcrypt from "bcryptjs";                          // For hashing new passwords
import nodemailer from "nodemailer";                    // For sending emails
import dayjs from "dayjs";                              // For date manipulation
import { prisma } from "../../../../config/database.config"; // Prisma Client instance
import { User, PasswordReset } from "@prisma/client";

const RESET_TOKEN_EXPIRY_HOURS = 1;                     // Token valid for 1 hour
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);                               // bcrypt salt rounds

// Configure Nodemailer transporter (Gmail example; adapt per your provider)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER || "magicallydev@gmail.com",
        pass: process.env.MAIL_PASS || "erot xrlh avwe bwqi",
    },
});


/**
 * Initiates the forgot-password flow.
 * - Finds the user by email
 * - Invalidates any existing active PasswordReset tokens
 * - Generates a secure random token (base64url)
 * - Hashes it (SHA256) and stores PasswordReset record with expiry
 * - Emails the raw token to the user’s email as a reset link
 */
export const forgotPassword = async (email: string): Promise<void> => {
    // 1. Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("User with provided email not found");  // 404-like error
    }

    // 2. Invalidate any existing active tokens for this user
    await prisma.passwordReset.updateMany({
        where: {
            userId: user.id,
            used: false,
            expiresAt: { gt: new Date() },
        },
        data: { used: true },
    });

    // 3. Generate a cryptographically secure random token
    const rawToken = crypto.randomBytes(32).toString("hex");  // 64 hex chars ≈ 256 bits entropy
    // 4. Hash the token before storing
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    // 5. Compute expiry time (e.g., now + 1 hour)
    const expiresAt = dayjs().add(RESET_TOKEN_EXPIRY_HOURS, "hour").toDate();

    // 6. Store new PasswordReset record
    await prisma.passwordReset.create({
        data: {
            tokenHash,
            expiresAt,
            userId: user.id,
        },
    });

    // 7. Construct reset URL (frontend consumes this link)
    const resetUrl = `${process.env.BASE_URL}/api/v1/auth/reset-password?token=${rawToken}&id=${user.id}`;

    const emailHtml = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset - Magic Billing</title>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        body {
            background-color: #f0f4f8;
            color: #2d3748;
            line-height: 1.6;
            padding: 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
        }
        
        .header {
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            padding: 40px 20px;
            text-align: center;
            color: white;
            position: relative;
        }
        
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
        }
        
        .logo i {
            font-size: 32px;
        }
        
        .header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-top: 15px;
        }
        
        .content {
            padding: 40px;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section h2 {
            font-size: 22px;
            color: #1a202c;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .section h2 i {
            color: #4299e1;
        }
        
        .text {
            margin-bottom: 15px;
            font-size: 16px;
            color: #4a5568;
        }
        
        .btn-container {
            text-align: center;
            margin: 35px 0;
        }
        
        .reset-btn {
            display: inline-block;
            background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
            color: white !important; 
            text-align: center;
            text-decoration: none;
            font-weight: 600;
            font-size: 18px;
            padding: 18px 45px;
            border-radius: 12px;
            box-shadow: 0 6px 15px rgba(37, 117, 252, 0.3);
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
        }
        
        .reset-btn:hover {
            transform: translateY(-3px);
            box-shadow: 0 10px 20px rgba(37, 117, 252, 0.4);
        }
        
        .reset-btn:active {
            transform: translateY(1px);
        }
        
        .info-box {
            background-color: #f0f7ff;
            border-left: 4px solid #4299e1;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        
        .info-box ul {
            padding-left: 25px;
        }
        
        .info-box li {
            margin-bottom: 10px;
        }
        
        .expiry-notice {
            display: inline-flex;
            align-items: center;
            background: #fff7f6;
            color: #e53e3e;
            padding: 12px 20px;
            border-radius: 8px;
            font-weight: 600;
            margin: 15px 0;
            gap: 10px;
        }
        
        .security-note {
            background: #fffaf0;
            border-left: 4px solid #ecc94b;
            padding: 20px;
            border-radius: 0 8px 8px 0;
            margin: 30px 0;
        }
        
        .footer {
            background: #f8fafc;
            text-align: center;
            padding: 30px;
            border-top: 1px solid #e2e8f0;
            color: #718096;
            font-size: 14px;
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
        
        .token-link {
            word-break: break-all;
            background: #f8fafc;
            border: 1px dashed #cbd5e0;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
            color: #4a5568;
        }
        
        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }
            
            .header {
                padding: 30px 15px;
            }
            
            .header h1 {
                font-size: 24px;
            }
            
            .section h2 {
                font-size: 20px;
            }
            
            .reset-btn {
                padding: 16px 30px;
                font-size: 16px;
                width: 100%;
                color: white !important; 
                text-align: center;
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
    <div class="email-container">
        <!-- Header Section -->
        <div class="header">
            <div class="logo">
                <i class="fas fa-magic"></i>
                Magic Billing
            </div>
            <h1>Reset Your Password</h1>
        </div>
        
        <!-- Content Section -->
        <div class="content">
            <div class="section">
                <p class="text">Hello,</p>
                <p class="text">We received a request to reset your Magic Billing account password. Click the button below to set a new password:</p>
                
                <div class="btn-container">
                    <a href=${resetUrl} class="reset-btn">
                        Reset Password
                    </a>
                </div>
                
                <div class="expiry-notice">
                    <i class="fas fa-clock"></i> This link expires in ${RESET_TOKEN_EXPIRY_HOURS} hours
                </div>
                
                <div class="security-note">
                    <p><strong><i class="fas fa-shield-alt"></i> Security Notice:</strong> For your protection, this link can only be used once. If you didn't request a password reset, please ignore this email or contact our support team immediately.</p>
                </div>
                
                <p class="text">If you're having trouble with the button above, you can also copy and paste this link into your browser:</p>
                <div class="token-link">
                    <a href="${resetUrl}">${resetUrl}</a>
                </div>
                
                <div class="info-box">
                    <h2><i class="fas fa-info-circle"></i> What to expect next:</h2>
                    <ul>
                        <li>You'll be taken to a secure page to create a new password</li>
                        <li>After resetting, you can log in with your new password</li>
                        <li>All your billing data and settings will remain unchanged</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <!-- Footer Section -->
        <div class="footer">
            <p>© ${new Date().getFullYear()} Magic Billing Inc. All rights reserved.</p>
            
            
            
             <p style="margin-top: 8px; color: #a0aec0;">
                                Magic Billing Inc.<br>
                                214/215 Shoham Arc,<br>
                                Surat, GJ 395005
                            </p>
            
            <div class="system-note">
                <i class="fas fa-exclamation-circle"></i> This is an automated system-generated message. Please do not reply to this email.
            </div>
        </div>
    </div>
</body>
</html>
    
    `

    // 8. Send reset email to user
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        html: emailHtml,
        // text: `You requested a password reset. Click the link below to reset your password (valid for ${RESET_TOKEN_EXPIRY_HOURS} hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    };

    await transporter.sendMail(mailOptions);
}


/**
 * Completes the forgot-password flow.
 * - Validates the token for the given user
 * - Checks expiry and “used” flag
 * - Hashes new password and updates the user
 * - Marks the PasswordReset record as used
 */
export const resetPassword = async (userId: string, rawToken: string, newPassword: string): Promise<void> => {
    // 1. Compute hash of the provided raw token
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");

    // 2. Find matching PasswordReset record
    const resetRecord = await prisma.passwordReset.findFirst({
        where: {
            userId,
            tokenHash,
            used: false,
            expiresAt: { gt: new Date() },
        },
    });
    // console.log("\n\n\n Reset Record:", resetRecord);
    
    if (!resetRecord) {
        throw new Error("Invalid or expired reset token");  // 400-like error
    }

    // 3. Hash the new password using bcrypt
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update the user's password in the User table
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });

    // 5. Mark token as used (single-use)
    try {
        await prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { used: true },
        });
    } catch (error) {
        console.error('\n\n Error updating password reset record:', error);
    }

}


/**
 * Allows authenticated users to change their password by verifying old password.
 * - Finds user by ID
 * - Compares provided old password with hashed password in DB
 * - Hashes new password and updates the user record
 */
export const changePassword = async (userId: string, oldPassword: string, newPassword: string): Promise<void> => {
    // 1. Find the user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error("User not found");  // 404-like
    }

    // 2. Compare old password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new Error("Old password is incorrect");  // 401-like
    }

    // 3. Hash the new password
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 4. Update the user’s password
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
}
