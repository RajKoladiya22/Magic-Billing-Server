import { Request, Response } from "express";
import { prisma } from "../../../config/database.config";
import { sendErrorResponse, sendSuccessResponse } from "../../../core/utils/httpResponse";
import { validate as isUUID } from "uuid";

const PAGE_SIZE = 10;

// 1. List Bills (with optional search & pagination)
export const listBills = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }

    const page = Math.max(1, parseInt((req.query.page as string) || "1"));
    const search = (req.query.search as string) || "";

    const where: any = { userId };
    if (search) {
        where.OR = [
            { documentNumber: { contains: search, mode: "insensitive" } },
            { reference: { contains: search, mode: "insensitive" } },
        ];
    }

    try {
        const total = await prisma.bill.count({ where });
        const data = await prisma.bill.findMany({
            where,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            orderBy: { documentDate: "desc" },
            include: { items: true },
        });
        sendSuccessResponse(res, 200, "Bills fetched.", { total, page, pageSize: PAGE_SIZE, data });
    } catch (err) {
        console.error("listBills error:", err);
        sendErrorResponse(res, 500, "Failed to list bills.");
    }
};

// 2. Fetch one Bill
export const getBill = async (req: Request, res: Response) => {
    const userId = req.user?.id, { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid bill ID.");
        return;
    }

    try {
        const bill = await prisma.bill.findFirst({
            where: { id, userId },
            include: { items: true },
        });
        if (!bill) {
            sendErrorResponse(res, 404, "Bill not found.");
            return;
        }
        sendSuccessResponse(res, 200, "Bill fetched.", bill);
    } catch (err) {
        console.error("getBill error:", err);
        sendErrorResponse(res, 500, "Failed to fetch bill.");
    }
};

// 3. Create Bill with nested items
export const createBill = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }

    const {
        type,
        documentNumber,
        documentDate,
        dueDate,
        invoice,
        billOfSupply,
        discountOn,
        dispatchAddress,
        shippingAddress,
        signature,
        reference,
        note,
        term,
        discount,
        charges,
        attachments,
        TDS,
        TCS,
        RCM,
        billStatus,
        billSummary,
        customerId,
        items,
    } = req.body;

    if (!type || !documentNumber || !documentDate) {
        {
            sendErrorResponse(res, 400, "Missing required fields: type, documentNumber, documentDate.");
            return;

        }
    }

    try {
        const bill = await prisma.bill.create({
            data: {
                type,
                documentNumber,
                documentDate: new Date(documentDate),
                dueDate: dueDate ? new Date(dueDate) : null,
                invoice: Boolean(invoice),
                billOfSupply: Boolean(billOfSupply),
                discountOn,
                dispatchAddress: dispatchAddress || null,
                shippingAddress: shippingAddress || null,
                signature: signature || null,
                reference: reference || null,
                note: note || null,
                term: term || null,
                discount: discount || null,
                charges: charges || null,
                attachments: Array.isArray(attachments) ? attachments : [],
                TDS: typeof TDS === "number" ? TDS : 0,
                TCS: typeof TCS === "number" ? TCS : 0,
                RCM: typeof RCM === "number" ? RCM : 0,
                billStatus,
                billSummary: billSummary || null,
                userId,
                customerId: isUUID(customerId) ? customerId : null,
                items: {
                    create: Array.isArray(items)
                        ? items.map((it: any) => ({
                            description: it.description,
                            quantity: it.quantity,
                            unitPrice: it.unitPrice,
                            discount: it.discount || 0,
                            discountType: it.discountType,
                            cgstAmount: it.cgstAmount || 0,
                            sgstAmount: it.sgstAmount || 0,
                            igstAmount: it.igstAmount || 0,
                            itemPrice: it.itemPrice,
                            itemPriceWithTax: it.itemPriceWithTax,
                            productId: isUUID(it.productId) ? it.productId : null,
                        }))
                        : [],
                },
            },
            include: { items: true },
        });
        sendSuccessResponse(res, 201, "Bill created.", bill);
    } catch (err: any) {
        console.error("createBill error:", err);
        sendErrorResponse(res, 400, err.message);
    }
};

// 4. Update Bill (and optionally items)
export const updateBill = async (req: Request, res: Response) => {
    const userId = req.user?.id, { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid bill ID.");
        return;
    }

    try {
        const exists = await prisma.bill.findFirst({ where: { id, userId } });
        if (!exists) {
            sendErrorResponse(res, 404, "Bill not found.");
            return

        }

        const data: any = { ...req.body };

        // If items included, we can replace via: items: { deleteMany: {}, create: [...] }
        if (Array.isArray(req.body.items)) {
            data.items = {
                deleteMany: {},
                create: req.body.items.map((it: any) => ({
                    description: it.description,
                    quantity: it.quantity,
                    unitPrice: it.unitPrice,
                    discount: it.discount || 0,
                    discountType: it.discountType,
                    cgstAmount: it.cgstAmount || 0,
                    sgstAmount: it.sgstAmount || 0,
                    igstAmount: it.igstAmount || 0,
                    itemPrice: it.itemPrice,
                    itemPriceWithTax: it.itemPriceWithTax,
                    productId: isUUID(it.productId) ? it.productId : null,
                })),
            };
        }

        const bill = await prisma.bill.update({
            where: { id },
            data,
            include: { items: true },
        });
        sendSuccessResponse(res, 200, "Bill updated.", bill);
    } catch (err: any) {
        console.error("updateBill error:", err);
        sendErrorResponse(res, 400, err.message);
    }
};

// 5. Delete one Bill (and cascade items)
export const deleteBill = async (req: Request, res: Response) => {
    const userId = req.user?.id, { id } = req.params;
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!isUUID(id)) {
        sendErrorResponse(res, 400, "Invalid bill ID.");
        return;
    }

    try {
        const del = await prisma.bill.deleteMany({ where: { id, userId } });
        if (del.count === 0) {
            sendErrorResponse(res, 404, "Bill not found.");
            return

        }
        sendSuccessResponse(res, 200, "Bill deleted.");
    } catch (err) {
        console.error("deleteBill error:", err);
        sendErrorResponse(res, 500, "Failed to delete bill.");
    }
};

// 6. Bulk delete Bills
export const bulkDeleteBills = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { ids } = req.body as { ids: string[] };
    if (!userId) {
        sendErrorResponse(res, 401, "Unauthorized");
        return;
    }
    if (!Array.isArray(ids) || !ids.every(isUUID)) {
        sendErrorResponse(res, 400, "Invalid IDs array.");
        return
    }

    try {
        const del = await prisma.bill.deleteMany({ where: { id: { in: ids }, userId } });
        sendSuccessResponse(res, 200, `Deleted ${del.count} bills.`);
    } catch (err) {
        console.error("bulkDeleteBills error:", err);
        sendErrorResponse(res, 500, "Failed to bulk delete bills.");
    }
};
