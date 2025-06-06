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

    // 8. Send reset email to user
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click the link below to reset your password (valid for ${RESET_TOKEN_EXPIRY_HOURS} hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
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
