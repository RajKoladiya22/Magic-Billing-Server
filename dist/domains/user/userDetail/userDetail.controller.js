"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserDetailHandler = exports.getUserDetailHandler = exports.createOrUpdateUserDetailHandler = void 0;
const userDetail_service_1 = require("./userDetail.service");
const httpResponse_1 = require("../../../core/utils/httpResponse");
const createOrUpdateUserDetailHandler = async (req, res, next) => {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
        if (!userId) {
            (0, httpResponse_1.sendErrorResponse)(res, 401, "Unauthorized");
            return;
        }
        if (!req.body || Object.keys(req.body).length === 0) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "No data provided to save.");
            return;
        }
        const cleanData = {
            companyName: (_b = req.body.companyName) !== null && _b !== void 0 ? _b : null,
            gstNumber: (_c = req.body.gstNumber) !== null && _c !== void 0 ? _c : null,
            panNumber: (_d = req.body.panNumber) !== null && _d !== void 0 ? _d : null,
            businessEmail: (_e = req.body.businessEmail) !== null && _e !== void 0 ? _e : null,
            phoneNumber: (_f = req.body.phoneNumber) !== null && _f !== void 0 ? _f : null,
            alternativePhoneNumber: (_g = req.body.alternativePhoneNumber) !== null && _g !== void 0 ? _g : null,
            website: (_h = req.body.website) !== null && _h !== void 0 ? _h : null,
            billingAddress: (_j = req.body.billingAddress) !== null && _j !== void 0 ? _j : {},
            shippingAddress: (_k = req.body.shippingAddress) !== null && _k !== void 0 ? _k : {},
            signatureImages: (_l = req.body.signatureImages) !== null && _l !== void 0 ? _l : [],
        };
        if (!req.body.companyName) {
            (0, httpResponse_1.sendErrorResponse)(res, 400, "Company name is required.");
            return;
        }
        const result = await (0, userDetail_service_1.upsertUserDetail)(userId, cleanData);
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