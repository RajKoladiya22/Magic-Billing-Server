import { prisma } from "../../config/database.config";
import dayjs from "dayjs";
import cron from "node-cron";


console.log("[INIT] Cleanup job scheduled in every 14 minutes.");

export const cleanupExpiredTokensAndOtps = async () => {
  const now = new Date();
  const before = dayjs().subtract(1, "day").toDate(); // for OTPs, optional grace period

  const [deletedTokens, deletedOtps] = await Promise.all([
    prisma.token.deleteMany({
      where: {
        OR: [
          { expiryDate: { lt: now } },
          { revoked: true },
        ],
      },
    }),
    prisma.oTP.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { used: true, createdAt: { lt: before } },
        ],
      },
    }),
  ]);

  console.log(`[CLEANUP] Removed ${deletedTokens.count} expired tokens.`);
  console.log(`[CLEANUP] Removed ${deletedOtps.count} used/expired OTPs.`);
};

setInterval(() => {
  cleanupExpiredTokensAndOtps();
}, 14 * 60 * 1000);

// cleanupExpiredTokensAndOtps();

// cron.schedule("0 3 * * *", () => {
//   console.log("[CLEANUP] Starting cleanup job at 3 AM...");
//   void (async () => {
//     try {
//       await cleanupExpiredTokensAndOtps();
//       console.log("[CLEANUP] Job completed.");
//     } catch (err) {
//       console.error("[CLEANUP] Job failed:", err);
//     }
//   })();
// });

