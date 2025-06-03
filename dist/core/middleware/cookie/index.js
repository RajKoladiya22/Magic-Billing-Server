"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setRefreshTokenCookie = setRefreshTokenCookie;
function setRefreshTokenCookie(res, token) {
    res.cookie("rJmkAxzNakU", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 1000 * 60 * 60 * 24,
    });
}
//# sourceMappingURL=index.js.map