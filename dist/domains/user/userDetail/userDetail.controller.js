"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDetailHandler = exports.getUserDetailHandler = exports.createOrUpdateUserDetailHandler = void 0;
const userDetail_service_1 = require("./userDetail.service");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const createOrUpdateUserDetailHandler = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        const result = await (0, userDetail_service_1.upsertUserDetail)(userId, req.body);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "User detail saved.", result);
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, err.message || "Failed to save user detail.");
    }
};
exports.createOrUpdateUserDetailHandler = createOrUpdateUserDetailHandler;
const getUserDetailHandler = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        const result = await (0, userDetail_service_1.getUserDetail)(userId);
        if (!result) {
            (0, httpResponse_1.sendErrorResponse)(res, 404, "User detail not found.");
            return;
        }
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "User detail fetched.", result);
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, err.message || "Failed to get user detail.");
    }
};
exports.getUserDetailHandler = getUserDetailHandler;
const updateUserDetailHandler = async (req, res, next) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        const result = await (0, userDetail_service_1.updateUserDetail)(userId, req.body);
        (0, httpResponse_1.sendSuccessResponse)(res, 200, "User detail updated.", result);
    }
    catch (err) {
        (0, httpResponse_1.sendErrorResponse)(res, 400, err.message || "Failed to update user detail.");
    }
};
exports.updateUserDetailHandler = updateUserDetailHandler;
//# sourceMappingURL=userDetail.controller.js.map