"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processResetPasswordForm = exports.renderResetPasswordForm = void 0;
const passwordReset_service_1 = require("./services/passwordReset.service");
const renderResetPasswordForm = (req, res) => {
    const { token, id: userId, error, success } = req.query;
    if (!token || !userId) {
        res
            .status(400)
            .send("Invalid link: missing token or user ID.");
    }
    res.render("password", {
        token: token,
        userId: userId,
        errorMessage: typeof error === "string" ? error : null,
        successMessage: typeof success === "string" ? success : null,
    });
};
exports.renderResetPasswordForm = renderResetPasswordForm;
const processResetPasswordForm = async (req, res) => {
    try {
        const { userId, token, newPassword, confirmPassword } = req.body;
        console.log("Processing reset password form with data:", {
            userId,
            token,
            newPassword,
            confirmPassword,
        });
        if (!userId || !token || !newPassword || !confirmPassword) {
            return res.redirect(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}&id=${encodeURIComponent(userId)}&error=All fields are required`);
        }
        if (newPassword !== confirmPassword) {
            return res.redirect(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}&id=${encodeURIComponent(userId)}&error=Passwords do not match`);
        }
        await (0, passwordReset_service_1.resetPassword)(userId, token, newPassword);
        return res.redirect(`/api/v1/auth/reset-password?token=${encodeURIComponent(token)}&id=${encodeURIComponent(userId)}&success=Password has been reset successfully`);
    }
    catch (err) {
        const message = encodeURIComponent(err.message || "Failed to reset password");
        return res.redirect(`/api/v1/auth/reset-password?token=${encodeURIComponent(req.body.token || "")}&id=${encodeURIComponent(req.body.userId || "")}&error=${message}`);
    }
};
exports.processResetPasswordForm = processResetPasswordForm;
//# sourceMappingURL=passwordResetView.controller.js.map