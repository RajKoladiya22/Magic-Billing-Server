import { Request, Response } from "express";
import { prisma } from "../../../config/database.config";
import { sendErrorResponse, sendSuccessResponse } from "../../../core/utils/httpResponse";
import { validate as isUUID } from "uuid";

const PAGE_SIZE = 10;

export const listCustomColumns = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }

    const search = (req.query.search as string) || "";
    const page = Math.max(1, parseInt((req.query.page as string) || "1"));

    const where: any = { userId };
    if (search) {
        where.label = { contains: search, mode: "insensitive" };
    }

    try {
        const total = await prisma.customColumn.count({ where });
        const data = await prisma.customColumn.findMany({
            where,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            orderBy: { createdAt: "desc" },
        });
        sendSuccessResponse(res, 200, "Custom columns listed.", {
            total,
            page,
            pageSize: PAGE_SIZE,
            data,
        });
    } catch (err: any) {
        console.error("listCustomColumns error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to list custom columns.");
    }
};

export const getCustomColumn = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid ID.");
        return

    }

    try {
        const col = await prisma.customColumn.findFirst({ where: { id, userId } });
        if (!col) {
            sendErrorResponse(res, 404, "Not found.");
            return;

        }
        sendSuccessResponse(res, 200, "Custom column fetched.", col);
    } catch (err: any) {
        console.error("getCustomColumn error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to fetch custom column.");
    }
};

export const createCustomColumn = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }

    const { name, label, dataType, isMultiSelect, options } = req.body;
    if (
        !name || !label ||
        !["STRING", "NUMBER", "DATE", "BOOLEAN", "SELECT"].includes(dataType)  // your ColumnType enums
    ) {
        sendErrorResponse(res, 400, "Missing or invalid fields.");
        return;
    }

    try {
        const col = await prisma.customColumn.create({
            data: {
                name,
                label,
                dataType,
                isMultiSelect: Boolean(isMultiSelect),
                options: Array.isArray(options) ? options : [],
                userId,
            },
        });
        sendSuccessResponse(res, 201, "Custom column created.", col);
    } catch (err: any) {
        console.error("createCustomColumn error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to create custom columns.");

    }
};

export const updateCustomColumn = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid ID.");
        return;

    }

    try {
        const exists = await prisma.customColumn.findFirst({ where: { id, userId } });
        if (!exists) {
            sendErrorResponse(res, 404, "Not found.");
            return

        }

        const { label, dataType, isMultiSelect, options, status } = req.body;
        const data: any = {};
        if (label !== undefined) data.label = label;
        if (dataType !== undefined) data.dataType = dataType;
        if (isMultiSelect !== undefined) data.isMultiSelect = Boolean(isMultiSelect);
        if (options !== undefined && Array.isArray(options)) data.options = options;
        if (status !== undefined) data.status = Boolean(status);

        const col = await prisma.customColumn.update({
            where: { id },
            data,
        });
        sendSuccessResponse(res, 200, "Custom column updated.", col);
    } catch (err: any) {
        console.error("updateCustomColumn error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to update custom columns.");

    }
};

export const deleteCustomColumn = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid ID.");
        return
    }
    try {
        const del = await prisma.customColumn.deleteMany({ where: { id, userId } });
        if (del.count === 0) {
            sendErrorResponse(res, 404, "Not found.");
            return;

        }
        sendSuccessResponse(res, 200, "Custom column deleted.");
    } catch (err: any) {
        console.error("deleteCustomColumn error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to delete custom columns.");

    }
};

export const bulkDeleteCustomColumns = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { ids } = req.body as { ids: string[] };
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!Array.isArray(ids) || !ids.every(isUUID)) {
        sendErrorResponse(res, 400, "Invalid IDs.");
        return;
    }

    try {
        const del = await prisma.customColumn.deleteMany({
            where: { id: { in: ids }, userId },
        });
        sendSuccessResponse(res, 200, `Deleted ${del.count} custom columns.`);
    } catch (err: any) {
        console.error("bulkDeleteCustomColumns error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to bulk delete custom columns.");
    }
};
