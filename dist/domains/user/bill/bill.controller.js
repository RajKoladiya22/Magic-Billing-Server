"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteBills = exports.deleteBill = exports.updateBill = exports.createBill = exports.getBill = exports.listBills = void 0;
const database_config_1 = require("../../../config/database.config");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const uuid_1 = require("uuid");
const PAGE_SIZE = 10;
const listBills = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const search = req.query.search || "";
    const where = { userId };
    if (search) {
        where.OR = [
            { documentNumber: { contains: search, mode: "insensitive" } },
            { reference: { contains: search, mode: "insensitive" } },
        ];
    }
    try {
        const total = await database_config_1.prisma.bill.count({ where });
        const data = await database_config_1.prisma.bill.findMany({
            where,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            orderBy: { documentDate: "desc" },
            include: { items: true },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Bills fetched.", { total, page, pageSize: PAGE_SIZE, data });
    }
    catch (err) {
        console.error("listBills error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to list bills.");
    }
};
exports.listBills = listBills;
const getBill = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid bill ID.");
        return;
    }
    try {
        const bill = await database_config_1.prisma.bill.findFirst({
            where: { id, userId },
            include: { items: true },
        });
        if (!bill) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Bill not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Bill fetched.", bill);
    }
    catch (err) {
        console.error("getBill error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to fetch bill.");
    }
};
exports.getBill = getBill;
const createBill = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    const { type, documentNumber, documentDate, dueDate, invoice, billOfSupply, discountOn, dispatchAddress, shippingAddress, signature, reference, note, term, discount, charges, attachments, TDS, TCS, RCM, billStatus, billSummary, customerId, items, } = req.body;
    if (!type || !documentNumber || !documentDate) {
        {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Missing required fields: type, documentNumber, documentDate.");
            return;
        }
    }
    try {
        const bill = await database_config_1.prisma.bill.create({
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
                customerId: (0, uuid_1.validate)(customerId) ? customerId : null,
                items: {
                    create: Array.isArray(items)
                        ? items.map((it) => ({
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
                            productId: (0, uuid_1.validate)(it.productId) ? it.productId : null,
                        }))
                        : [],
                },
            },
            include: { items: true },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 201, "Bill created.", bill);
    }
    catch (err) {
        console.error("createBill error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, 400, err.message);
    }
};
exports.createBill = createBill;
const updateBill = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid bill ID.");
        return;
    }
    try {
        const exists = await database_config_1.prisma.bill.findFirst({ where: { id, userId } });
        if (!exists) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Bill not found.");
            return;
        }
        const data = { ...req.body };
        if (Array.isArray(req.body.items)) {
            data.items = {
                deleteMany: {},
                create: req.body.items.map((it) => ({
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
                    productId: (0, uuid_1.validate)(it.productId) ? it.productId : null,
                })),
            };
        }
        const bill = await database_config_1.prisma.bill.update({
            where: { id },
            data,
            include: { items: true },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Bill updated.", bill);
    }
    catch (err) {
        console.error("updateBill error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, 400, err.message);
    }
};
exports.updateBill = updateBill;
const deleteBill = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid bill ID.");
        return;
    }
    try {
        const del = await database_config_1.prisma.bill.deleteMany({ where: { id, userId } });
        if (del.count === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Bill not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Bill deleted.");
    }
    catch (err) {
        console.error("deleteBill error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to delete bill.");
    }
};
exports.deleteBill = deleteBill;
const bulkDeleteBills = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { ids } = req.body;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!Array.isArray(ids) || !ids.every(uuid_1.validate)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid IDs array.");
        return;
    }
    try {
        const del = await database_config_1.prisma.bill.deleteMany({ where: { id: { in: ids }, userId } });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, `Deleted ${del.count} bills.`);
    }
    catch (err) {
        console.error("bulkDeleteBills error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to bulk delete bills.");
    }
};
exports.bulkDeleteBills = bulkDeleteBills;
//# sourceMappingURL=bill.controller.js.map