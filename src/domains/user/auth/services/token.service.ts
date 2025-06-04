// src/domains/user/service/token.service.ts

import { prisma } from "./user.model";
import { Token as PrismaToken } from "@prisma/client";
import dayjs from "dayjs";

/**
 * Parses a string like "7d", "15m", "1h" into a dayjs manipulation object.
 * Supports: "s" → seconds, "m" → minutes, "h" → hours, "d" → days.
 */
const parseExpiryString = (
  expiry: string
): { value: number; unit: dayjs.ManipulateType } => {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    throw new Error("Invalid expiry format. Use '15m', '1h', '7d', etc.");
  }
  const value = parseInt(match[1], 10);
  const unitMap: { [key: string]: dayjs.ManipulateType } = {
    s: "second",
    m: "minute",
    h: "hour",
    d: "day",
  };
  const unit = unitMap[match[2]];
  return { value, unit };
};

/**
 * Stores a new Refresh Token in the Token table.
 * - userId: the user’s UUID
 * - token: the signed JWT refresh‐token string
 * - expiresIn: string like "7d" (should match JWT_REFRESH_EXPIRES_IN)
 */
export const storeRefreshToken = async (
  userId: string,
  token: string,
  expiresIn: string
): Promise<PrismaToken> => {
  const existingToken = await prisma.token.findUnique({
    where: { userId, revoked: false, expiryDate: { gt: new Date() } },
  });

  if (existingToken) {
    console.log(
      `Refresh token already exists for user ${userId}, using existing token.`
    );
    return existingToken;
  }

  const { value, unit } = parseExpiryString(expiresIn);
  const expiryDate = dayjs().add(value, unit).toDate();
  console.log(
    `Storing refresh token for user ${userId} with expiry ${expiryDate}`
  );

  return prisma.token.create({
    data: {
      userId,
      token,
      expiryDate,
      revoked: false,
    },
  });
};

/**
 * Finds a refresh‐token record by token string, only if:
 *  - exists
 *  - not revoked
 *  - expiryDate > now
 */
  

/**
 * Revokes a given refresh‐token (sets revoked = true).
 */
export const revokeRefreshToken = async (token: string): Promise<void> => {
  await prisma.token.updateMany({
    where: { token },
    data: { revoked: true },
  });
};
