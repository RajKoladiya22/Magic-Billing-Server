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


export const createOrUpdateUserDetailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) : Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) { sendErrorResponse(res, 401, "Unauthorized");return; }

    const result = await upsertUserDetail(userId, req.body);
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
): Promise<void>  => {
  try {
    const userId = req.user?.id;
    if (!userId) { sendErrorResponse(res, 401, "Unauthorized");return; }

    const result = await updateUserDetail(userId, req.body);
    sendSuccessResponse(res, 200, "User detail updated.", result);
  } catch (err: any) {
    sendErrorResponse(res, 400, err.message || "Failed to update user detail.");
  }
};
