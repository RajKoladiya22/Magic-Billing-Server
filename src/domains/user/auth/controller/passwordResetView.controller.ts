// import { Request, Response, NextFunction } from "express";
// import { prisma } from "../../../../config/database.config";
// import {
//   resetPassword,
// } from "../services/passwordReset.service";
// import crypto from 'crypto';

// /**
//  * Renders the EJS form for setting a new password.
//  * Expects `token` and `id` as query parameters.
//  * Optionally reads `error` or `success` messages from query.
//  */
// export const renderResetPasswordForm = async (req: Request, res: Response) => {
//   const { token, id: userId, error, success } = req.query;
//   // console.log("\n\n Rendering reset password form with query params:", {
//   //   token,
//   //   userId,
//   //   error,
//   //   success,
//   // });

//   // Basic validation: token and userId must be present
//     if (!token || !userId) {
//     return res.status(400).render('password', {
//       token: '',
//       userId: '',
//       errorMessage: 'Invalid link: missing token or user ID.',
//       successMessage: null,
//     });
//   }
//   const tokenHash = crypto.createHash('sha256').update(token as string).digest('hex');
//     const resetRecord = await prisma.passwordReset.findFirst({
//     where: {
//       userId: userId as string,
//       tokenHash,
//       used: false,
//       expiresAt: { gt: new Date() },
//     },
//   });

//   if (!resetRecord) {
//     return res.status(400).render('password', {
//       token: token as string,
//       userId: userId as string,
//       errorMessage: 'Reset link is invalid or has expired.',
//       successMessage: null,
//     });
//   }

//   if (!resetRecord) {
//     res.render("password", {
//       token: token as string,
//       userId: userId as string,
//       errorMessage: typeof error === "string" ? error : null,
//       successMessage: typeof success === "string" ? success : null,
//     });
//   }
//   // Pass `token`, `userId`, and any flash messages to the template
//   res.render("password", {
//     token: token as string,
//     userId: userId as string,
//     errorMessage: typeof error === "string" ? error : null,
//     successMessage: typeof success === "string" ? success : null,
//   });
// };

// /**
//  * Handles POST /auth/reset-password from the EJS form submission.
//  * Expects `userId`, `token`, `newPassword`, `confirmPassword` in req.body.
//  * On success, redirects back to GET with success message.
//  * On error, redirects back with an error message.
//  */
// export const processResetPasswordForm = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { userId, token, newPassword, confirmPassword } = req.body;
//     console.log("\n\n\n Processing reset password form with data:", {
//       userId,
//       token,
//       newPassword,
//       confirmPassword,
//     });

//     // 1. Basic validation: all fields present
//     if (!userId || !token || !newPassword || !confirmPassword) {
//       return res.redirect(
//         `/api/v1/auth/reset-password?token=${encodeURIComponent(
//           token
//         )}&id=${encodeURIComponent(
//           userId
//         )}&error=All fields are required`
//       );
//     }

//     // 2. Check newPassword vs confirmPassword
//     if (newPassword !== confirmPassword) {
//       return res.redirect(
//         `/api/v1/auth/reset-password?token=${encodeURIComponent(
//           token
//         )}&id=${encodeURIComponent(
//           userId
//         )}&error=Passwords do not match`
//       );
//     }

//     // 3. Call service to verify token and update password
//     await resetPassword(userId, token, newPassword);

//     // 4. On success, redirect with a success message
//     return res.redirect(
//       `/api/v1/auth/reset-password?token=${encodeURIComponent(
//         token
//       )}&id=${encodeURIComponent(
//         userId
//       )}&success=Password has been reset successfully`
//     );
//   } catch (err: any) {
//     // On error (e.g., invalid/expired token), send the error back as a query param
//     const message = encodeURIComponent(err.message || "Failed to reset password");
//     return res.redirect(
//       `/api/v1/auth/reset-password?token=${encodeURIComponent(
//         req.body.token || ""
//       )}&id=${encodeURIComponent(
//         req.body.userId || ""
//       )}&error=${message}`
//     );
//   }
// };



import { Request, Response } from "express";
import { prisma } from "../../../../config/database.config";
import { resetPassword } from "../services/passwordReset.service";
import crypto from "crypto";

export const renderResetPasswordForm = async (req: Request, res: Response) => {
  try {
    const { token, id: userId, error, success } = req.query;

    if (!token || !userId) {
      return res.status(400).render("password", {
        token: "",
        userId: "",
        errorMessage: "Invalid link: missing token or user ID.",
        successMessage: null,
      });
    }

    const tokenHash = crypto.createHash("sha256").update(token as string).digest("hex");

    const resetRecord = await prisma.passwordReset.findFirst({
      where: {
        userId: userId as string,
        tokenHash,
        used: false,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetRecord) {
      return res.status(400).render("password", {
        token: token as string,
        userId: userId as string,
        errorMessage: null,
        successMessage: "Reset link is invalid or has expired.",
      });
    }

    // If valid token, render form with optional error or success messages
    return res.render("password", {
      token: token as string,
      userId: userId as string,
      errorMessage: typeof error === "string" ? error : null,
      successMessage: typeof success === "string" ? success : null,
    });
  } catch (err) {
    console.error("Error rendering reset password form:", err);
    return res.status(500).render("password", {
      token: "",
      userId: "",
      errorMessage: "An unexpected error occurred. Please try again later.",
      successMessage: null,
    });
  }
};

export const processResetPasswordForm = async (req: Request, res: Response) => {
  try {
    const { userId, token, newPassword, confirmPassword } = req.body;

    if (!userId || !token || !newPassword || !confirmPassword) {
      return res.redirect(
        `/api/v1/auth/reset-password?token=${encodeURIComponent(token || "")}&id=${encodeURIComponent(
          userId || ""
        )}&error=${encodeURIComponent("All fields are required")}`
      );
    }

    if (newPassword !== confirmPassword) {
      return res.redirect(
        `/api/v1/auth/reset-password?token=${encodeURIComponent(token)}&id=${encodeURIComponent(
          userId
        )}&error=${encodeURIComponent("Passwords do not match")}`
      );
    }

    await resetPassword(userId, token, newPassword);

    return res.redirect(
      `/api/v1/auth/reset-password?token=${encodeURIComponent(token)}&id=${encodeURIComponent(
        userId
      )}&success=${encodeURIComponent("Password has been reset successfully")}`
    );
  } catch (err: any) {
    console.error("Error processing reset password form:", err);
    const message = encodeURIComponent(err.message || "Failed to reset password");
    return res.redirect(
      `/api/v1/auth/reset-password?token=${encodeURIComponent(req.body.token || "")}&id=${encodeURIComponent(
        req.body.userId || ""
      )}&error=${message}`
    );
  }
};
