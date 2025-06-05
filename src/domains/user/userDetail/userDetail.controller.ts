import { Request, Response, NextFunction } from "express";
import {
  getUserDetail,
  upsertUserDetail,
  updateUserDetail,
} from "./userDetail.service";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../../core/utils/httpResponse";
import { IUserDetailInput } from "src/interfaces/userDetail.interface";

export const createOrUpdateUserDetailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendErrorResponse(res, 401, "Unauthorized");
      return;
    }
    if (!req.body || Object.keys(req.body).length === 0) {
      sendErrorResponse(res, 400, "No data provided to save.");
      return;
    }
    const cleanData: IUserDetailInput = {
      companyName: req.body.companyName ?? null,
      gstNumber: req.body.gstNumber ?? null,
      panNumber: req.body.panNumber ?? null,
      businessEmail: req.body.businessEmail ?? null,
      phoneNumber: req.body.phoneNumber ?? null,
      alternativePhoneNumber: req.body.alternativePhoneNumber ?? null,
      website: req.body.website ?? null,
      billingAddress: req.body.billingAddress ?? {},
      shippingAddress: req.body.shippingAddress ?? {},
      signatureImages: req.body.signatureImages ?? [],
    };
    // Validate required fields if necessary
    if (!req.body.companyName) {
      sendErrorResponse(res, 400, "Company name is required.");
      return;
    }

    const result = await upsertUserDetail(userId, cleanData); 
    sendSuccessResponse(res, 200, "User detail saved.", result);
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Failed to save user detail.");
  }
};

export const getUserDetailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendErrorResponse(res, 401, "Unauthorized");
      return;
    }

    const result = await getUserDetail(userId);
    if (!result) {
      sendErrorResponse(res, 404, "User detail not found.");
      return;
    }

    sendSuccessResponse(res, 200, "User detail fetched.", result);
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Failed to get user detail.");
  }
};

export const updateUserDetailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendErrorResponse(res, 401, "Unauthorized");
      return;
    }

    const result = await updateUserDetail(userId, req.body);
    sendSuccessResponse(res, 200, "User detail updated.", result);
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Failed to update user detail.");
  }
};
