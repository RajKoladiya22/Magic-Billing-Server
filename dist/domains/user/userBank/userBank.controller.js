"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHandler = exports.updateHandler = exports.detailHandler = exports.listHandler = exports.createHandler = void 0;
const userBank_service_1 = require("./userBank.service");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const userBank_schema_1 = require("./userBank.schema");
const createHandler = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const parsed = userBank_schema_1.createUserBankSchema.safeParse(req.body);
        if (!parsed.success) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Invalid request data", parsed.error.errors);
            return;
        }
        const bank = await (0, userBank_service_1.createUserBank)(userId, parsed.data);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "User Bank detail saved.", bank);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to create user bank.");
        }
    }
};
exports.createHandler = createHandler;
const listHandler = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const banks = await (0, userBank_service_1.getUserBanks)(userId);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "User Bank detail list.", banks);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to create user bank.");
        }
    }
};
exports.listHandler = listHandler;
const detailHandler = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    const { id } = req.params;
    if (!id) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, "Bank ID is required");
        return;
    }
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const bank = await (0, userBank_service_1.getUserBankById)(id, userId);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "User Bank detail fetched.", bank);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to fetch user bank.");
        }
    }
};
exports.detailHandler = detailHandler;
const updateHandler = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const updated = await (0, userBank_service_1.updateUserBank)(userId, req.params.id, req.body);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "User Bank detail updated.", updated);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to update user bank.");
        }
    }
};
exports.updateHandler = updateHandler;
const deleteHandler = async (req, res) => {
    var _a;
    const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
    if (!userId) {
        (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
        return;
    }
    try {
        const deleted = await (0, userBank_service_1.deleteUserBank)(userId, req.params.id);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "User Bank detail deleted.", deleted);
    }
    catch (error) {
        if (error instanceof Error) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, error.message);
        }
        else {
            (0, httpResponse_1.sendErrorResponse)(res, 500, "Failed to delete user bank.");
        }
    }
};
exports.deleteHandler = deleteHandler;
//# sourceMappingURL=userBank.controller.js.map