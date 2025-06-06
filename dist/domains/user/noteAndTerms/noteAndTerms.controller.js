"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHandler = exports.updateHandler = exports.detailHandler = exports.listHandler = exports.createHandler = void 0;
const noteAndTerms_service_1 = require("./noteAndTerms.service");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const createHandler = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        const record = await (0, noteAndTerms_service_1.createNoteAndTerms)(userId, req.body);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Created NoteAndTerms", record);
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
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        const records = await (0, noteAndTerms_service_1.getNoteAndTerms)(userId);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Fetched NoteAndTerms", records);
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
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { id } = req.params;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        if (!id) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "ID required");
            return;
        }
        const record = await (0, noteAndTerms_service_1.getNoteAndTermsById)(id, userId);
        if (!record) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "NoteAndTerms not found");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "Fetched NoteAndTerms", record);
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
exports.detailHandler = detailHandler;
const updateHandler = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { id } = req.params;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        if (!id) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "ID required");
            return;
        }
        const updated = await (0, noteAndTerms_service_1.updateNoteAndTerms)(userId, id, req.body);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "NoteAndTerms Updated", updated);
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
exports.updateHandler = updateHandler;
const deleteHandler = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id, { id } = req.params;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        if (!id) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "ID required");
            return;
        }
        const deleted = await (0, noteAndTerms_service_1.deleteNoteAndTerms)(userId, id);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "NoteAndTerms Deleted successfully", deleted);
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
exports.deleteHandler = deleteHandler;
//# sourceMappingURL=noteAndTerms.controller.js.map