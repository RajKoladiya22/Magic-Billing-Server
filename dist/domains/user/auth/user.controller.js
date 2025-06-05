"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.refreshAccessTokenHandler = exports.signinHandler = exports.signupHandler = exports.verifyOtpHandler = exports.sendOtpHandler = void 0;
const user_service_1 = require("./services/user.service");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const dotenv_1 = __importDefault(require("dotenv"));
const jwt_1 = require("../../../core/middleware/jwt");
const token_service_1 = require("./services/token.service");
const cookie_1 = require("../../../core/middleware/cookie");
const jsonwebtoken_1 = __importStar(require("jsonwebtoken"));
dotenv_1.default.config();
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "1h";
const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || "10m";
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
        const accessToken = (0, jwt_1.generateAccessToken)(user.id, user.role);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user.id, user.role);
        await (0, token_service_1.storeRefreshToken)(user.id, refreshToken, REFRESH_EXPIRES_IN);
        (0, cookie_1.setRefreshTokenCookie)(res, accessToken);
        (0, httpResponse_1.sendSuccessResponse)(res, 201, "User registered successfully.", {
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
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
        if (!email) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Email is required.");
            return;
        }
        if (!password) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Password is required.");
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
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                role: user.role,
                isActive: user.isActive,
                isVerified: user.isVerified,
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
        let accessToken = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.rJmkAxzNakU;
        if (!accessToken) {
            const authHeader = req.headers.authorization;
            if (authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer ")) {
                accessToken = authHeader.split(" ")[1];
            }
        }
        if (!accessToken) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Refresh token missing.");
            return;
        }
        let payload = null;
        try {
            payload = jsonwebtoken_1.default.verify(accessToken, ACCESS_SECRET, {
                algorithms: ["HS256"],
            });
        }
        catch (err) {
            if (err instanceof jsonwebtoken_1.TokenExpiredError) {
                payload = jsonwebtoken_1.default.decode(accessToken);
            }
            else {
                (0, httpResponse_1.sendErrorResponse)(res, 401, "Invalid access token.");
                return;
            }
        }
        if (!(payload === null || payload === void 0 ? void 0 : payload.id) || !payload.role) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Invalid or malformed refresh token.");
            return;
        }
        const stored = await (0, token_service_1.findValidRefreshToken)(payload === null || payload === void 0 ? void 0 : payload.id);
        if (!stored) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Refresh token invalid or expired.");
            return;
        }
        const newAccessToken = (0, jwt_1.generateAccessToken)(payload.id, payload.role);
        (0, cookie_1.setRefreshTokenCookie)(res, newAccessToken);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Access token refreshed.", {
            tokens: {
                accessToken: newAccessToken,
            },
        });
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, err.message || "Failed to refresh access token.");
    }
};
exports.refreshAccessTokenHandler = refreshAccessTokenHandler;
//# sourceMappingURL=user.controller.js.map