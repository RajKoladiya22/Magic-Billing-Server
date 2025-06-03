"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizeRoles = exports.authenticateUser = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const httpResponse_1 = require("../../utils/httpResponse");
dotenv_1.default.config();
const ACCESS_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET;
const REFRESH_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET;
const ACCESS_EXPIRES_IN = process.env.JWT_ACCESS_EXPIRES_IN || "15m";
const REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || "1d";
const generateAccessToken = (userId, role) => {
    const options = {
        expiresIn: ACCESS_EXPIRES_IN,
        algorithm: "HS256",
    };
    return jsonwebtoken_1.default.sign({ id: userId, role }, ACCESS_SECRET, options);
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (userId, role) => {
    const options = {
        expiresIn: REFRESH_EXPIRES_IN,
        algorithm: "HS256",
    };
    return jsonwebtoken_1.default.sign({ id: userId, role }, REFRESH_SECRET, options);
};
exports.generateRefreshToken = generateRefreshToken;
const verifyAccessToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, ACCESS_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
const verifyRefreshToken = (token) => {
    try {
        return jsonwebtoken_1.default.verify(token, REFRESH_SECRET);
    }
    catch {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
const authenticateUser = (req, res, next) => {
    var _a;
    try {
        let token;
        token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.rJmkAxzNakU;
        if (!token) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith("Bearer ")) {
                token = authHeader.split(" ")[1];
            }
        }
        if (!token) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Authentication token missing");
            return;
        }
        const decoded = jsonwebtoken_1.default.verify(token, ACCESS_SECRET, {
            algorithms: ["HS256"],
        });
        if (!decoded ||
            typeof decoded !== "object" ||
            !decoded.id ||
            !decoded.role) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Invalid token payload");
            return;
        }
        req.user = {
            id: decoded.id,
            role: decoded.role,
        };
        next();
    }
    catch (err) {
        console.log("err.name---->", err.name);
        console.log("\n\nerr---->", err);
        if (err.name === "TokenExpiredError") {
            res.clearCookie("rJmkAxzNakU", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "strict",
            });
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Token expired");
            return;
        }
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized access");
        return;
    }
};
exports.authenticateUser = authenticateUser;
const authorizeRoles = (...allowedRoles) => (req, res, next) => {
    var _a;
    const role = (_a = req.user) === null || _a === void 0 ? void 0 : _a.role;
    if (!role || !allowedRoles.includes(role)) {
        (0, httpResponse_1.sendErrorResponse)(res, 403, "Forbidden:You Don't have Permission");
        return;
    }
    next();
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=index.js.map