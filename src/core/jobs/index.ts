import { prisma } from "../../config/database.config";
import dayjs from "dayjs";
import cron from "node-cron";



console.log("[INIT] Cleanup job scheduled in every 14 minutes.");

export const cleanupExpiredTokensAndOtps = async () => {
  const now = new Date();
  const before = dayjs().subtract(1, "day").toDate(); // for OTPs, optional grace period

  const [deletedTokens, deletedOtps, deletedReset] = await Promise.all([
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
          {used: true,}
        ],
      },
    }),
    prisma.passwordReset.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: now } },
          { used: true, createdAt: { lt: before } },
          {used: true,}
        ],
      },
    }),
  ]);

  console.log(`[CLEANUP] Removed ${deletedTokens.count} expired tokens.`);
  console.log(`[CLEANUP] Removed ${deletedOtps.count} used/expired OTPs.`);
  console.log(`[CLEANUP] Removed ${deletedReset.count} used/expired Reset token.`);
};

export const startCleanupJobWithTimeout = () => {
  const INTERVAL_MS = 10 * 60 * 1000;

  const runner = async () => {
    console.log("[CLEANUP] Running cleanup via recursive setTimeout…");
    try {
      await cleanupExpiredTokensAndOtps();
    } catch (err) {
      console.error("[CLEANUP] Error:", err);
    }
    // schedule next
    setTimeout(runner, INTERVAL_MS);
  };

  // initial kick-off
  setTimeout(runner, INTERVAL_MS);
}


// setInterval(() => {
//   cleanupExpiredTokensAndOtps();
// }, 60 * 1000);

// export function startCleanupJob() {
//   console.log("[INIT] Scheduling cleanup job every 14 minutes.");
//   cron.schedule(
//     "*/14 * * * *",
//     () => {
//       cleanupExpiredTokensAndOtps().catch(err => {
//         console.error("[CLEANUP] Uncaught error in cleanup task:", err);
//       });
//     },
//     { scheduled: true, timezone: "UTC" }
//   );
// }

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

