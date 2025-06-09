import { Request, Response } from "express";
import { prisma } from "../../../config/database.config";
import { sendErrorResponse, sendSuccessResponse } from "../../../core/utils/httpResponse";
import { validate as isUUID } from "uuid";

const PAGE_SIZE = 10;

export const listCustomers = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }

    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const search = (req.query.search as string) || "";

    // Default type to CUSTOMER, allow ?type=VENDER override
    const typeQuery = (req.query.type as string)?.toUpperCase();
    const typeFilter = typeQuery === "VENDOR" ? "VENDOR" : "CUSTOMER";

    const where: any = { userId, type: typeFilter };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ];
    }

    try {
        const total = await prisma.customer.count({ where });
        const data = await prisma.customer.findMany({
            where,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            orderBy: { createdAt: "desc" },
        });
        sendSuccessResponse(res, 200, "Customers fetched.", { total, page, pageSize: PAGE_SIZE, data });
    } catch (err: any) {
        console.error("listCustomers error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to list customers");

    }
};

export const getCustomer = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid customer ID.");
        return;
    }

    try {
        const cust = await prisma.customer.findFirst({ where: { id, userId } });
        if (!cust) {
            sendErrorResponse(res, 404, "Customer not found.");
            return;

        }
        sendSuccessResponse(res, 200, "Customer fetched.", cust);
    } catch (err: any) {
        console.error("getCustomer error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to fetch customer");
    }
};

export const createCustomer = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }

    const {
        type,
        name,
        email,
        phone,
        billingAddress,
        shippingAddress,
        companyDetails,
        preferences,
        details,
        tags,
        customColumnId,
    } = req.body;

    if (!type || !name) {
        sendErrorResponse(res, 400, "Missing required fields: type and name.");
        return;
    }

    try {
        const cust = await prisma.customer.create({
            data: {
                type,
                name,
                email: email || null,
                phone: phone || null,
                billingAddress: billingAddress || null,
                shippingAddress: shippingAddress || null,
                companyDetails: companyDetails || null,
                preferences: preferences || null,
                details: details || null,
                tags: Array.isArray(tags) ? tags : [],
                customColumnId: isUUID(customColumnId) ? customColumnId : null,
                userId,
            },
        });
        sendSuccessResponse(res, 201, "Customer created.", cust);
    } catch (err: any) {
        console.error("createCustomer error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to create customer");

    }
};

export const updateCustomer = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid customer ID.");
        return;
    }

    try {
        const existing = await prisma.customer.findFirst({ where: { id, userId } });
        if (!existing) {
            sendErrorResponse(res, 404, "Customer not found.");
            return;

        }

        const {
            type,
            name,
            email,
            phone,
            billingAddress,
            shippingAddress,
            companyDetails,
            preferences,
            details,
            tags,
            customColumnId,
        } = req.body;

        const data: any = {};
        if (type !== undefined) data.type = type;
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (phone !== undefined) data.phone = phone;
        if (billingAddress !== undefined) data.billingAddress = billingAddress;
        if (shippingAddress !== undefined) data.shippingAddress = shippingAddress;
        if (companyDetails !== undefined) data.companyDetails = companyDetails;
        if (preferences !== undefined) data.preferences = preferences;
        if (details !== undefined) data.details = details;
        if (tags !== undefined && Array.isArray(tags)) data.tags = tags;
        if (customColumnId !== undefined && isUUID(customColumnId)) data.customColumnId = customColumnId;

        const cust = await prisma.customer.update({
            where: { id },
            data,
        });
        sendSuccessResponse(res, 200, "Customer updated.", cust);
    } catch (err: any) {
        console.error("updateCustomer error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to update customer");

    }
};

export const deleteCustomer = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid customer ID.");
        return;
    }

    try {
        const del = await prisma.customer.deleteMany({ where: { id, userId } });
        if (del.count === 0) {
            sendErrorResponse(res, 404, "Customer not found.");
            return;
        }
        sendSuccessResponse(res, 200, "Customer deleted.");
    } catch (err: any) {
        console.error("deleteCustomer error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to delete customer");

    }
};

export const bulkDeleteCustomers = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { ids } = req.body as { ids: string[] };
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!Array.isArray(ids) || !ids.every(isUUID)) {
        sendErrorResponse(res, 400, "Invalid IDs array.");
        return;
    }

    try {
        const del = await prisma.customer.deleteMany({
            where: { id: { in: ids }, userId },
        });
        sendSuccessResponse(res, 200, `Deleted ${del.count} customers.`);
    } catch (err: any) {
        console.error("bulkDeleteCustomers error:", err);
        sendErrorResponse(res, err instanceof Error ? 400 : 500, err.message || "Failed to bulk delete customers");

    }
};
