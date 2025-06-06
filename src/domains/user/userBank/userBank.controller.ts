// controllers/userBank.controller.ts
import { Request, Response } from "express";
import {
  createUserBank,
  getUserBanks,
  // getUserBankById,
  updateUserBank,
  deleteUserBank,
  getUserBankById,
} from "./userBank.service";
import {
  sendErrorResponse,
  sendSuccessResponse,
} from "../../../core/utils/httpResponse";
import { createUserBankSchema } from "./userBank.schema";

export const createHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendErrorResponse(res, 401, "Unauthorized");
      return;
    }
    // console.log("req.body--->", req.body);
    
    const parsed = createUserBankSchema.safeParse(req.body);
    // console.log("\n\nparsed.data--->", parsed.data);
    // console.log("\n\nparsed--->", parsed);
    if (!parsed.success) {
      sendErrorResponse(res, 400, "Invalid request data", parsed.error.errors);
      return;
    }
    const bank = await createUserBank(userId, parsed.data);
    sendSuccessResponse(res, 200, "User Bank detail saved.", bank);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to create user bank.");
    }
  }
};

export const listHandler = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      sendErrorResponse(res, 401, "Unauthorized");
      return;
    }
    const banks = await getUserBanks(userId);
    sendSuccessResponse(res, 200, "User Bank detail list.", banks);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to create user bank.");
    }
  }
};

export const detailHandler = async (req: Request, res: Response) => {

  const userId = req.user?.id;
  const { id } = req.params;
  // console.log("req.params--->", req.params);
  // console.log("req.user--->", req.user);
  if (!id) {
    sendErrorResponse(res, 400, "Bank ID is required");
    return;
  }
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }
  try {
    const bank = await getUserBankById(id, userId);
    sendSuccessResponse(res, 200, "User Bank detail fetched.", bank);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 404, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to fetch user bank.");
    }
  }

};

export const updateHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }
  try {
    const updated = await updateUserBank(userId, req.params.id, req.body);
    sendSuccessResponse(res, 200, "User Bank detail updated.", updated);

  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to update user bank.");
    }

  }
};

export const deleteHandler = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    sendErrorResponse(res, 401, "Unauthorized");
    return;
  }
  try {
    const deleted = await deleteUserBank(userId, req.params.id);
    sendSuccessResponse(res, 200, "User Bank detail deleted.", deleted);
  } catch (error) {
    if (error instanceof Error) {
      sendErrorResponse(res, 400, error.message);
    } else {
      sendErrorResponse(res, 500, "Failed to delete user bank.");
    }
  }
};
