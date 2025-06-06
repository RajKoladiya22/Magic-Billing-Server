import { Request, Response } from "express";
import {
    createNoteAndTerms,
    getNoteAndTerms,
    getNoteAndTermsById,
    updateNoteAndTerms,
    deleteNoteAndTerms,
} from "./noteAndTerms.service";
import {
    sendErrorResponse,
    sendSuccessResponse,
} from "../../../core/utils/httpResponse";

export const createHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            sendErrorResponse(res, 401, "Unauthorized");
            return;
        }
        const record = await createNoteAndTerms(userId, req.body);
        sendSuccessResponse(res, 200, "Created NoteAndTerms", record);
    } catch (error: any) {
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
        const records = await getNoteAndTerms(userId);
        sendSuccessResponse(res, 200, "Fetched NoteAndTerms", records);
    } catch (error: any) {
        if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to create user bank.");
        }
    }
};

export const detailHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id, { id } = req.params;
        // console.log("\n\n\nUser ID:", userId, "NoteAndTerms ID:", id);
        if (!userId) {
            sendErrorResponse(res, 401, "Unauthorized");
            return;
        }
        if (!id) {
            sendErrorResponse(res, 400, "ID required");
            return;
        }
        // console.log("\n\n\n",getNoteAndTermsById(id, userId));
        
        const record = await getNoteAndTermsById(id, userId);
        // console.log("\n\n Fetched NoteAndTerms:", record);
        if (!record) {
            sendErrorResponse(res, 404, "NoteAndTerms not found");
            return;
        }
        sendSuccessResponse(res, 200, "Fetched NoteAndTerms", record);

    } catch (error: any) {
        if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to create user bank.");
        }
    }
};

export const updateHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id, { id } = req.params;
        if (!userId) {
            sendErrorResponse(res, 401, "Unauthorized");
            return;
        }
        if (!id) {
            sendErrorResponse(res, 400, "ID required");
            return;
        }
        const updated = await updateNoteAndTerms(userId, id, req.body);
        sendSuccessResponse(res, 200, "NoteAndTerms Updated", updated);

    } catch (error: any) {
        if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to create user bank.");
        }
    }
};

export const deleteHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.id, { id } = req.params;
        if (!userId) {
            sendErrorResponse(res, 401, "Unauthorized");
            return;
        }
        if (!id) {
            sendErrorResponse(res, 400, "ID required");
            return;
        }
        const deleted = await deleteNoteAndTerms(userId, id);
        sendSuccessResponse(res, 200, "NoteAndTerms Deleted successfully", deleted);

    } catch (error: any) {
        if (error instanceof Error) {
            sendErrorResponse(res, 400, error.message);
        } else {
            sendErrorResponse(res, 500, "Failed to create user bank.");
        }
    }
};
