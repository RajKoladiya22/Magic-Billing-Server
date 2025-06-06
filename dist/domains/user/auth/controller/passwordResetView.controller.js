"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResetPasswordForm = exports.renderResetPasswordForm = void 0;
const database_config_1 = require("../../../../config/database.config");
const passwordReset_service_1 = require("../services/passwordReset.service");
const crypto_1 = __importDefault(require("crypto"));
const renderResetPasswordForm = async (req, res) => {
    try {
        const { token, id: userId, error, success } = req.query;
        if (!token || !userId) {
            return res.status(400).render("password", {
                token: "",
                userId: "",
                errorMessage: "Invalid link: missing token or user ID.",
                successMessage: null,
            });
        }
        const tokenHash = crypto_1.default.createHash("sha256").update(token).digest("hex");
        const resetRecord = await database_config_1.prisma.passwordReset.findFirst({
            where: {
                userId: userId,
                tokenHash,
                used: false,
                expiresAt: { gt: new Date() },
            },
        });
        if (!resetRecord) {
            return res.status(400).render("password", {
                token: token,
                userId: userId,
                errorMessage: null,
                successMessage: "Reset link is invalid or has expired.",
            });
        }
        return res.render("password", {
            token: token,
            userId: userId,
            errorMessage: typeof error === "string" ? error : null,
            successMessage: typeof success === "string" ? success : null,
        });
    }
    catch (err) {
        console.error("Error rendering reset password form:", err);
        return res.status(500).render("password", {
            token: "",
            userId: "",
            errorMessage: "An unexpected error occurred. Please try again later.",
            successMessage: null,
        });
    }
};
exports.renderResetPasswordForm = renderResetPasswordForm;
const processResetPasswordForm = async (req, res) => {
    try {
        const { userId, token, newPassword, confirmPassword } = req.body;
        if (!userId || !token || !newPassword || !confirmPassword) {
            return res.redirect(`/api/v1/auth/reset-password?token=${encodeURIComponent(token || "")}&id=${encodeURIComponent(userId || "")}&error=${encodeURIComponent("All fields are required")}`);
        }
        if (newPassword !== confirmPassword) {
            return res.redirect(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}&id=${encodeURIComponent(userId)}&error=${encodeURIComponent("Passwords do not match")}`);
        }
        await (0, passwordReset_service_1.resetPassword)(userId, token, newPassword);
        return res.redirect(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}&id=${encodeURIComponent(userId)}&success=${encodeURIComponent("Password has been reset successfully")}`);
    }
    catch (err) {
        console.error("Error processing reset password form:", err);
        const message = encodeURIComponent(err.message || "Failed to reset password");
        return res.redirect(`/api/v1/auth/reset-password?token=${encodeURIComponent(req.body.token || "")}&id=${encodeURIComponent(req.body.userId || "")}&error=${message}`);
    }
};
exports.processResetPasswordForm = processResetPasswordForm;
//# sourceMappingURL=passwordResetView.controller.js.map