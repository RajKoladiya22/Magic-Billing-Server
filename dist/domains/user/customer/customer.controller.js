"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteCustomers = exports.deleteCustomer = exports.updateCustomer = exports.createCustomer = exports.getCustomer = exports.listCustomers = void 0;
const database_config_1 = require("../../../config/database.config");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const uuid_1 = require("uuid");
const PAGE_SIZE = 10;
const listCustomers = async (req, res) => {
    var _a, _b;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const search = req.query.search || "";
    const typeQuery = (_b = req.query.type) === null || _b === void 0 ? void 0 : _b.toUpperCase();
    const typeFilter = typeQuery === "VENDOR" ? "VENDOR" : "CUSTOMER";
    const where = { userId, type: typeFilter };
    if (search) {
        where.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { phone: { contains: search, mode: "insensitive" } },
        ];
    }
    try {
        const total = await database_config_1.prisma.customer.count({ where });
        const data = await database_config_1.prisma.customer.findMany({
            where,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            orderBy: { createdAt: "desc" },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Customers fetched.", { total, page, pageSize: PAGE_SIZE, data });
    }
    catch (err) {
        console.error("listCustomers error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to list customers");
    }
};
exports.listCustomers = listCustomers;
const getCustomer = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid customer ID.");
        return;
    }
    try {
        const cust = await database_config_1.prisma.customer.findFirst({ where: { id, userId } });
        if (!cust) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Customer not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Customer fetched.", cust);
    }
    catch (err) {
        console.error("getCustomer error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to fetch customer");
    }
};
exports.getCustomer = getCustomer;
const createCustomer = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    const { type, name, email, phone, billingAddress, shippingAddress, companyDetails, preferences, details, tags, customColumnId, } = req.body;
    if (!type || !name) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Missing required fields: type and name.");
        return;
    }
    try {
        const cust = await database_config_1.prisma.customer.create({
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
                customColumnId: (0, uuid_1.validate)(customColumnId) ? customColumnId : null,
                userId,
            },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 201, "Customer created.", cust);
    }
    catch (err) {
        console.error("createCustomer error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to create customer");
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid customer ID.");
        return;
    }
    try {
        const existing = await database_config_1.prisma.customer.findFirst({ where: { id, userId } });
        if (!existing) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Customer not found.");
            return;
        }
        const { type, name, email, phone, billingAddress, shippingAddress, companyDetails, preferences, details, tags, customColumnId, } = req.body;
        const data = {};
        if (type !== undefined)
            data.type = type;
        if (name !== undefined)
            data.name = name;
        if (email !== undefined)
            data.email = email;
        if (phone !== undefined)
            data.phone = phone;
        if (billingAddress !== undefined)
            data.billingAddress = billingAddress;
        if (shippingAddress !== undefined)
            data.shippingAddress = shippingAddress;
        if (companyDetails !== undefined)
            data.companyDetails = companyDetails;
        if (preferences !== undefined)
            data.preferences = preferences;
        if (details !== undefined)
            data.details = details;
        if (tags !== undefined && Array.isArray(tags))
            data.tags = tags;
        if (customColumnId !== undefined && (0, uuid_1.validate)(customColumnId))
            data.customColumnId = customColumnId;
        const cust = await database_config_1.prisma.customer.update({
            where: { id },
            data,
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Customer updated.", cust);
    }
    catch (err) {
        console.error("updateCustomer error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to update customer");
    }
};
exports.updateCustomer = updateCustomer;
const deleteCustomer = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid customer ID.");
        return;
    }
    try {
        const del = await database_config_1.prisma.customer.deleteMany({ where: { id, userId } });
        if (del.count === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Customer not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Customer deleted.");
    }
    catch (err) {
        console.error("deleteCustomer error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to delete customer");
    }
};
exports.deleteCustomer = deleteCustomer;
const bulkDeleteCustomers = async (req, res) => {
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
        const del = await database_config_1.prisma.customer.deleteMany({
            where: { id: { in: ids }, userId },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, `Deleted ${del.count} customers.`);
    }
    catch (err) {
        console.error("bulkDeleteCustomers error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to bulk delete customers");
    }
};
exports.bulkDeleteCustomers = bulkDeleteCustomers;
//# sourceMappingURL=customer.controller.js.map