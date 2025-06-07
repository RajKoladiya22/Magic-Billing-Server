"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = void 0;
const cloudnary_1 = __importDefault(require("../../../../core/utils/cloudnary"));
const uploadToCloudinary = async (path) => {
    try {
        const result = await cloudnary_1.default.uploader.upload(path, {
            folder: 'magicBilling/products',
        });
        return result;
    }
    catch (err) {
        throw err;
    }
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (imagePublicId) => {
    try {
        const result = await cloudnary_1.default.uploader.destroy(imagePublicId, {});
        return result;
    }
    catch (err) {
        throw err;
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=uploadToCloudinary.service.js.map