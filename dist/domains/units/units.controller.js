"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUnitsBulk = exports.createUnitsBulk = exports.deleteUnit = exports.updateUnit = exports.createUnit = exports.getUnitById = exports.getAllUnits = void 0;
const database_config_1 = require("../../config/database.config");
const httpResponse_1 = require("../../core/utils/httpResponse");
const client_1 = require("@prisma/client");
const uuid_1 = require("uuid");
const getAllUnits = async (req, res) => {
    try {
        const searchTerm = req.query.search || "";
        const whereClause = searchTerm
            ? {
                name: {
                    contains: searchTerm,
                    mode: client_1.Prisma.QueryMode.insensitive,
                },
            }
            : {};
        const units = await database_config_1.prisma.unit.findMany({
            where: whereClause,
            orderBy: { name: "asc" },
        });
        if (units.length === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "No units found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Units retrieved successfully.", units);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to fetch units.");
        }
    }
};
exports.getAllUnits = getAllUnits;
const getUnitById = async (req, res) => {
    const { id } = req.params;
    if (!(0, uuid_1.validate)(id)) {
        throw new Error('Invalid UUID format');
    }
    try {
        const unit = await database_config_1.prisma.unit.findUnique({
            where: { id },
        });
        if (!unit) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Unit not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Units retrieved successfully.", unit);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to fetch units.");
        }
    }
};
exports.getUnitById = getUnitById;
const createUnit = async (req, res) => {
    const { name, abbreviation } = req.body;
    if (!name || typeof name !== "string" || name.trim().length === 0) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Name is required and must be a non-empty string.");
        return;
    }
    try {
        const newUnit = await database_config_1.prisma.unit.create({
            data: {
                name: name.trim(),
                abbreviation: (abbreviation === null || abbreviation === void 0 ? void 0 : abbreviation.trim()) || null,
            },
        });
        if (!newUnit) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Failed to create unit.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Units retrieved successfully.", newUnit);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to create units.");
        }
    }
};
exports.createUnit = createUnit;
const updateUnit = async (req, res) => {
    const { id } = req.params;
    const { name, abbreviation } = req.body;
    if (!(0, uuid_1.validate)(id)) {
        throw new Error('Invalid UUID format');
    }
    if (name !== undefined && (typeof name !== "string" || name.trim().length === 0)) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "If provided, name must be a non-empty string.");
        return;
    }
    try {
        const existing = await database_config_1.prisma.unit.findUnique({ where: { id } });
        if (!existing) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Unit not found.");
            return;
        }
        const updatedUnit = await database_config_1.prisma.unit.update({
            where: { id },
            data: {
                name: name !== undefined ? name.trim() : undefined,
                abbreviation: abbreviation !== undefined ? abbreviation.trim() : undefined,
            },
        });
        if (!updatedUnit) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Failed to update unit.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Units updated successfully.", updatedUnit);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to update units.");
        }
    }
};
exports.updateUnit = updateUnit;
const deleteUnit = async (req, res) => {
    const { id } = req.params;
    if (!(0, uuid_1.validate)(id)) {
        throw new Error('Invalid UUID format');
    }
    try {
        const existing = await database_config_1.prisma.unit.findUnique({ where: { id } });
        if (!existing) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "Unit not found.");
            return;
        }
        const deletedUnit = await database_config_1.prisma.unit.delete({ where: { id } });
        if (!deletedUnit) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Failed to delete unit.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Unit deleted successfully.", deletedUnit);
    }
    catch (error) {
        console.error(`Error deleting unit with id=${id}:`, error);
        if (error.code === "P2003") {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Cannot delete unit because it is referenced by other records.");
        }
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to delete units.");
        }
    }
};
exports.deleteUnit = deleteUnit;
const createUnitsBulk = async (req, res) => {
    try {
        const payload = req.body;
        if (!Array.isArray(payload) || payload.length === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Request body must be a non-empty array of units.");
            return;
        }
        const dataToInsert = [];
        for (const item of payload) {
            if (typeof item !== "object" ||
                item === null ||
                typeof item.name !== "string" ||
                item.name.trim().length === 0) {
                (0, httpResponse_1.sendErrorResponse)(res, 400, "Each array element must be an object with a non-empty string `name`.");
                return;
            }
            dataToInsert.push({
                name: item.name.trim(),
                abbreviation: typeof item.abbreviation === "string" && item.abbreviation.trim().length > 0
                    ? item.abbreviation.trim()
                    : null,
            });
        }
        const result = await database_config_1.prisma.unit.createMany({
            data: dataToInsert,
            skipDuplicates: false,
        });
        (0, httpResponse_1.sendSuccessResponse)(res, 201, `Successfully inserted ${result.count} unit(s).`, result);
    }
    catch (error) {
        console.error("Error in createUnitsBulk:", error.message);
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to create units in bulk.");
        }
    }
};
exports.createUnitsBulk = createUnitsBulk;
const deleteUnitsBulk = async (req, res) => {
    try {
        const { ids } = req.body;
        console.log("\n\n\n Received IDs for bulk delete:", ids);
        if (!Array.isArray(ids) || ids.length === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Request body must include a non-empty array of unit IDs.");
            return;
        }
        for (const id of ids) {
            if (typeof id !== "string" || !(0, uuid_1.validate)(id)) {
                (0, httpResponse_1.sendErrorResponse)(res, 400, `Invalid UUID format: ${id}`);
                return;
            }
        }
        const deleteResult = await database_config_1.prisma.unit.deleteMany({
            where: {
                id: {
                    in: ids,
                },
            },
        });
        if (deleteResult.count === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "No units were deleted. Check that the IDs exist.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, `Successfully deleted ${deleteResult.count} unit(s).`, deleteResult);
    }
    catch (error) {
        console.error("Error in deleteUnitsBulk:", error);
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to delete units in bulk.");
        }
    }
};
exports.deleteUnitsBulk = deleteUnitsBulk;
//# sourceMappingURL=units.controller.js.map