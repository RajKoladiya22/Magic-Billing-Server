"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("./user.controller");
const jwt_1 = require("../../../core/middleware/jwt");
const router = express_1.default.Router();
router.get("/check", (req, res, next) => {
    res.status(200).json({ message: "Check endpoint is working!" });
});
router.post("/send-otp", jwt_1.authenticateUser, user_controller_1.sendOtpHandler);
router.post("/verify-otp", jwt_1.authenticateUser, user_controller_1.verifyOtpHandler);
router.post("/signup", user_controller_1.signupHandler);
router.post("/signin", user_controller_1.signinHandler);
router.post("/refresh-token", user_controller_1.refreshAccessTokenHandler);
exports.default = router;
//# sourceMappingURL=user.route.js.map