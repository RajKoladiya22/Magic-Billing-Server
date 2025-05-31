"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessTokenHandler = exports.signinHandler = exports.signupHandler = exports.verifyOtpHandler = exports.sendOtpHandler = void 0;
const user_service_1 = require("./services/user.service");
const httpResponse_1 = require("../../core/utils/httpResponse");
const dotenv_1 = __importDefault(require("dotenv"));
const jwt_1 = require("../../core/middleware/jwt");
const token_service_1 = require("./services/token.service");
const cookie_1 = require("../../core/middleware/cookie");
dotenv_1.default.config();
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN;
const sendOtpHandler = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Email is required.");
            return;
        }
        await (0, user_service_1.sendOtp)(email);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "OTP sent successfully.", {});
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, err.message || "Failed to send OTP.");
    }
};
exports.sendOtpHandler = sendOtpHandler;
const verifyOtpHandler = async (req, res, next) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Email and code are required.");
            return;
        }
        await (0, user_service_1.verifyOtp)(email, code);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "OTP verified successfully.", {});
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, err.message || "OTP verification failed.");
    }
};
exports.verifyOtpHandler = verifyOtpHandler;
const signupHandler = async (req, res, next) => {
    try {
        const { firstName, lastName, email, password } = req.body;
        if (!firstName || !lastName || !email || !password) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "All fields are required.");
            return;
        }
        const user = await (0, user_service_1.signupUser)({ firstName, lastName, email, password });
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, "user");
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id, "user");
        await (0, token_service_1.storeRefreshToken)(user.id, refreshToken, REFRESH_EXPIRES_IN);
        (0, cookie_1.setRefreshTokenCookie)(res, accessToken);
        (0, httpResponse_1.sendSuccessResponse)(res, 201, "User registered successfully.", {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
            tokens: {
                accessToken,
            },
        });
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, err.message || "Signup failed.");
    }
};
exports.signupHandler = signupHandler;
const signinHandler = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Email and password are required.");
            return;
        }
        const user = await (0, user_service_1.signinUser)({ email, password });
        if (!user) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Invalid email or password.");
            return;
        }
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id, user.role);
        await (0, token_service_1.storeRefreshToken)(user.id, refreshToken, REFRESH_EXPIRES_IN);
        (0, cookie_1.setRefreshTokenCookie)(res, accessToken);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Signed in successfully.", {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
            },
            tokens: {
                accessToken,
            },
        });
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, err.message || "Signin failed.");
    }
};
exports.signinHandler = signinHandler;
const refreshAccessTokenHandler = async (req, res, next) => {
    var _a;
    try {
        let refreshToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.rJmkUxzNakU;
        if (!refreshToken) {
            const authHeader = req.headers.authorization;
            if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) {
                refreshToken = authHeader.split(" ")[1];
            }
        }
        if (!refreshToken) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Refresh token missing.");
            return;
        }
        const payload = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (!(payload === null || payload === void 0 ? void 0 : payload.id) || !payload.role) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Invalid or malformed refresh token.");
            return;
        }
        const stored = await (0, token_service_1.findValidRefreshToken)(refreshToken);
        if (!stored) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Refresh token invalid or expired.");
            return;
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)(payload.id, payload.role);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Access token refreshed.", {
            accessToken: newAccessToken,
        });
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, err.message || "Failed to refresh access token.");
    }
};
exports.refreshAccessTokenHandler = refreshAccessTokenHandler;
//# sourceMappingURL=user.controller.js.map