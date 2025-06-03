import { Response } from "express";

export function setRefreshTokenCookie(res: Response, token: string) {
  res.cookie("rJmkAxzNakU", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24, // 1 days in ms (should match JWT_REFRESH_EXPIRES_IN)
  });
}