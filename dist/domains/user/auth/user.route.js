"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./controller/user.controller");
const jwt_1 = require("../../../core/middleware/jwt");
const passwordResetView_controller_1 = require("./controller/passwordResetView.controller");
const router = express_1.default.Router();
router.get("/check", (req, res, next) => {
    res.status(200).json({ message: "Check endpoint is working!" });
});
router.post("/send-otp", jwt_1.authenticateUser, user_controller_1.sendOtpHandler);
router.post("/verify-otp", jwt_1.authenticateUser, user_controller_1.verifyOtpHandler);
router.post("/signup", user_controller_1.signupHandler);
router.post("/signin", user_controller_1.signinHandler);
router.post("/refresh-token", user_controller_1.refreshAccessTokenHandler);
router.post("/forgot-password", user_controller_1.forgotPasswordHandler);
router.post("/reset-password-json", user_controller_1.resetPasswordHandler);
router.post("/change-password", jwt_1.authenticateUser, user_controller_1.changePasswordHandler);
router.post("/reset-password", passwordResetView_controller_1.processResetPasswordForm);
router.get("/reset-password", passwordResetView_controller_1.renderResetPasswordForm);
exports.default = router;
//# sourceMappingURL=user.route.js.map