"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bulkDeleteCustomColumns = exports.deleteCustomColumn = exports.updateCustomColumn = exports.createCustomColumn = exports.getCustomColumn = exports.listCustomColumns = void 0;
const database_config_1 = require("../../../config/database.config");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const uuid_1 = require("uuid");
const PAGE_SIZE = 10;
const listCustomColumns = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    const search = req.query.search || "";
    const page = Math.max(1, parseInt(req.query.page || "1"));
    const where = { userId };
    if (search) {
        where.label = { contains: search, mode: "insensitive" };
    }
    try {
        const total = await database_config_1.prisma.customColumn.count({ where });
        const data = await database_config_1.prisma.customColumn.findMany({
            where,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE,
            orderBy: { createdAt: "desc" },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Custom columns listed.", {
            total,
            page,
            pageSize: PAGE_SIZE,
            data,
        });
    }
    catch (err) {
        console.error("listCustomColumns error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to list custom columns.");
    }
};
exports.listCustomColumns = listCustomColumns;
const getCustomColumn = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid ID.");
        return;
    }
    try {
        const col = await database_config_1.prisma.customColumn.findFirst({ where: { id, userId } });
        if (!col) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Custom column fetched.", col);
    }
    catch (err) {
        console.error("getCustomColumn error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to fetch custom column.");
    }
};
exports.getCustomColumn = getCustomColumn;
const createCustomColumn = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    const { name, label, dataType, isMultiSelect, options } = req.body;
    if (!name || !label ||
        !["STRING", "NUMBER", "DATE", "BOOLEAN", "SELECT"].includes(dataType)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Missing or invalid fields.");
        return;
    }
    try {
        const col = await database_config_1.prisma.customColumn.create({
            data: {
                name,
                label,
                dataType,
                isMultiSelect: Boolean(isMultiSelect),
                options: Array.isArray(options) ? options : [],
                userId,
            },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 201, "Custom column created.", col);
    }
    catch (err) {
        console.error("createCustomColumn error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to create custom columns.");
    }
};
exports.createCustomColumn = createCustomColumn;
const updateCustomColumn = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid ID.");
        return;
    }
    try {
        const exists = await database_config_1.prisma.customColumn.findFirst({ where: { id, userId } });
        if (!exists) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Not found.");
            return;
        }
        const { label, dataType, isMultiSelect, options, status } = req.body;
        const data = {};
        if (label !== undefined)
            data.label = label;
        if (dataType !== undefined)
            data.dataType = dataType;
        if (isMultiSelect !== undefined)
            data.isMultiSelect = Boolean(isMultiSelect);
        if (options !== undefined && Array.isArray(options))
            data.options = options;
        if (status !== undefined)
            data.status = Boolean(status);
        const col = await database_config_1.prisma.customColumn.update({
            where: { id },
            data,
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Custom column updated.", col);
    }
    catch (err) {
        console.error("updateCustomColumn error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to update custom columns.");
    }
};
exports.updateCustomColumn = updateCustomColumn;
const deleteCustomColumn = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid ID.");
        return;
    }
    try {
        const del = await database_config_1.prisma.customColumn.deleteMany({ where: { id, userId } });
        if (del.count === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Custom column deleted.");
    }
    catch (err) {
        console.error("deleteCustomColumn error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to delete custom columns.");
    }
};
exports.deleteCustomColumn = deleteCustomColumn;
const bulkDeleteCustomColumns = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { ids } = req.body;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!Array.isArray(ids) || !ids.every(uuid_1.validate)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid IDs.");
        return;
    }
    try {
        const del = await database_config_1.prisma.customColumn.deleteMany({
            where: { id: { in: ids }, userId },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, `Deleted ${del.count} custom columns.`);
    }
    catch (err) {
        console.error("bulkDeleteCustomColumns error:", err);
        (0, httpResponse_1.sendErrorResponse)(res, err instanceof Error ? 400 : 500, err.message || "Failed to bulk delete custom columns.");
    }
};
exports.bulkDeleteCustomColumns = bulkDeleteCustomColumns;
//# sourceMappingURL=customColumn.controller.js.map