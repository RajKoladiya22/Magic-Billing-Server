"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategoriesBulk = exports.deleteCategory = exports.updateCategory = exports.createCategoriesBulk = exports.createCategory = exports.getCategoryById = exports.getAllCategories = void 0;
const database_config_1 = require("../../../config/database.config");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const getAllCategories = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const searchTerm = req.query.search || "";
        const whereClause = {
            userId,
            ...(searchTerm
                ? {
                    name: {
                        contains: searchTerm,
                        mode: client_1.Prisma.QueryMode.insensitive,
                    },
                }
                : {}),
        };
        const categories = await database_config_1.prisma.category.findMany({
            where: whereClause,
            orderBy: { name: "asc" },
        });
        if (categories.length === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "No categories found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Categories retrieved successfully.", categories);
    }
    catch (error) {
        console.error("Error fetching categories:", error);
        (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to fetch categories.");
    }
};
exports.getAllCategories = getAllCategories;
const getCategoryById = async (req, res) => {
    var _a;
    const { id } = req.params;
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid UUID format for category ID.");
        return;
    }
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const category = await database_config_1.prisma.category.findUnique({
            where: { id, userId },
        });
        if (!category) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Category not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Category retrieved successfully.", category);
    }
    catch (error) {
        console.error(`Error fetching category with id=${id}:`, error);
        (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to fetch category.");
    }
};
exports.getCategoryById = getCategoryById;
const createCategory = async (req, res) => {
    var _a;
    const { name, hsnCode, description } = req.body;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Name is required and must be a non-empty string.");
        return;
    }
    if (!userId || typeof userId !== "string" || !(0, uuid_1.validate)(userId)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "userId is required and must be a valid UUID.");
        return;
    }
    try {
        const newCategory = await database_config_1.prisma.category.create({
            data: {
                name: name.trim(),
                userId,
                hsnCode: typeof hsnCode === "string" && hsnCode.trim().length > 0 ? hsnCode.trim() : null,
                description: typeof description === "string" && description.trim().length > 0
                    ? description.trim()
                    : null,
            },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 201, "Category created successfully.", newCategory);
    }
    catch (error) {
        console.error("Error creating category:", error);
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to create category.");
        }
    }
};
exports.createCategory = createCategory;
const createCategoriesBulk = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const payload = req.body;
        if (!Array.isArray(payload) || payload.length === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Request body must be a non-empty array of categories.");
            return;
        }
        const dataToInsert = [];
        for (const item of payload) {
            if (typeof item !== "object" ||
                item === null ||
                typeof item.name !== "string" ||
                item.name.trim().length === 0) {
                (0, httpResponse_1.sendErrorResponse)(res, 400, "Each element must be an object with non-empty string `name`.");
                return;
            }
            dataToInsert.push({
                name: item.name.trim(),
                userId,
                hsnCode: typeof item.hsnCode === "string" && item.hsnCode.trim().length > 0
                    ? item.hsnCode.trim()
                    : null,
                description: typeof item.description === "string" && item.description.trim().length > 0
                    ? item.description.trim()
                    : null,
            });
        }
        const result = await database_config_1.prisma.category.createMany({
            data: dataToInsert,
            skipDuplicates: false,
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 201, `Successfully inserted ${result.count} category(ies).`, { insertedCount: result.count });
    }
    catch (error) {
        console.error("Error in createCategoriesBulk:", error);
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to create categories in bulk.");
        }
    }
};
exports.createCategoriesBulk = createCategoriesBulk;
const updateCategory = async (req, res) => {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    const { name, hsnCode, description } = req.body;
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid UUID format for category ID.");
        return;
    }
    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "If provided, `name` must be a non-empty string.");
        return;
    }
    if (userId !== undefined && (typeof userId !== "string" || !(0, uuid_1.validate)(userId))) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "If provided, `userId` must be a valid UUID.");
        return;
    }
    try {
        const existing = await database_config_1.prisma.category.findUnique({ where: { id, userId } });
        if (!existing) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Category not found.");
            return;
        }
        const updated = await database_config_1.prisma.category.update({
            where: { id, userId },
            data: {
                name: name !== undefined ? name.trim() : undefined,
                hsnCode: hsnCode !== undefined ? (hsnCode.trim() || null) : undefined,
                description: description !== undefined ? (description.trim() || null) : undefined,
            },
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Category updated successfully.", updated);
    }
    catch (error) {
        console.error(`Error updating category with id=${id}:`, error);
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to update category.");
        }
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (req, res) => {
    var _a;
    const { id } = req.params;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    if (!(0, uuid_1.validate)(id)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid UUID format for category ID.");
        return;
    }
    try {
        const existing = await database_config_1.prisma.category.findUnique({ where: { id, userId } });
        if (!existing) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Category not found.");
            return;
        }
        const deleted = await database_config_1.prisma.category.delete({ where: { id, userId } });
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Category deleted successfully.", deleted);
    }
    catch (error) {
        console.error(`Error deleting category with id=${id}:`, error);
        if (error.code === "P2003") {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Cannot delete category because it is referenced by other records.");
        }
        else if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to delete category.");
        }
    }
};
exports.deleteCategory = deleteCategory;
const deleteCategoriesBulk = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Request body must include a non-empty array of category IDs.");
            return;
        }
        for (const id of ids) {
            if (typeof id !== "string" || !(0, uuid_1.validate)(id)) {
                (0, httpResponse_1.sendErrorResponse)(res, 400, `Invalid UUID format: ${id}`);
                return;
            }
        }
        const deleteResult = await database_config_1.prisma.category.deleteMany({
            where: {
                id: { in: ids },
                userId
            },
        });
        if (deleteResult.count === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "No categories were deleted. Check that the IDs exist.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, `Successfully deleted ${deleteResult.count} category(ies).`, { deletedCount: deleteResult.count });
    }
    catch (error) {
        console.error("Error in deleteCategoriesBulk:", error);
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to delete categories in bulk.");
        }
    }
};
exports.deleteCategoriesBulk = deleteCategoriesBulk;
//# sourceMappingURL=categories.controller.js.map