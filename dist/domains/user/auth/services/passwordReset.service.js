"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.resetPassword = exports.forgotPassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const dayjs_1 = __importDefault(require("dayjs"));
const database_config_1 = require("../../../../config/database.config");
const RESET_TOKEN_EXPIRY_HOURS = 1;
const SALT_ROUNDS = parseInt(process.env.SALT_ROUNDS || "12", 10);
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.MAIL_USER || "magicallydev@gmail.com",
        pass: process.env.MAIL_PASS || "erot xrlh avwe bwqi",
    },
});
const forgotPassword = async (email) => {
    const user = await database_config_1.prisma.user.findUnique({ where: { email } });
    if (!user) {
        throw new Error("User with provided email not found");
    }
    await database_config_1.prisma.passwordReset.updateMany({
        where: {
            userId: user.id,
            used: false,
            expiresAt: { gt: new Date() },
        },
        data: { used: true },
    });
    const rawToken = crypto_1.default.randomBytes(32).toString("hex");
    const tokenHash = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = (0, dayjs_1.default)().add(RESET_TOKEN_EXPIRY_HOURS, "hour").toDate();
    await database_config_1.prisma.passwordReset.create({
        data: {
            tokenHash,
            expiresAt,
            userId: user.id,
        },
    });
    const resetUrl = `${process.env.BASE_URL}/api/v1/auth/reset-password?token=${rawToken}&id=${user.id}`;
    const mailOptions = {
        from: process.env.MAIL_USER,
        to: user.email,
        subject: "Password Reset Request",
        text: `You requested a password reset. Click the link below to reset your password (valid for ${RESET_TOKEN_EXPIRY_HOURS} hour):\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`,
    };
    await transporter.sendMail(mailOptions);
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (userId, rawToken, newPassword) => {
    const tokenHash = crypto_1.default.createHash("sha256").update(rawToken).digest("hex");
    const resetRecord = await database_config_1.prisma.passwordReset.findFirst({
        where: {
            userId,
            tokenHash,
            used: false,
            expiresAt: { gt: new Date() },
        },
    });
    if (!resetRecord) {
        throw new Error("Invalid or expired reset token");
    }
    const salt = await bcryptjs_1.default.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
    await database_config_1.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
    try {
        await database_config_1.prisma.passwordReset.update({
            where: { id: resetRecord.id },
            data: { used: true },
        });
    }
    catch (error) {
        console.error('\n\n Error updating password reset record:', error);
    }
};
exports.resetPassword = resetPassword;
const changePassword = async (userId, oldPassword, newPassword) => {
    const user = await database_config_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
        throw new Error("User not found");
    }
    const isMatch = await bcryptjs_1.default.compare(oldPassword, user.password);
    if (!isMatch) {
        throw new Error("Old password is incorrect");
    }
    const salt = await bcryptjs_1.default.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcryptjs_1.default.hash(newPassword, salt);
    await database_config_1.prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    });
};
exports.changePassword = changePassword;
//# sourceMappingURL=passwordReset.service.js.map