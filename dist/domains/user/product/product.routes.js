"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const jwt_1 = require("../../../core/middleware/jwt");
const product_controller_1 = require("./product.controller");
const upload = (0, multer_1.default)({ dest: "/tmp" });
const router = (0, express_1.Router)();
router.use(jwt_1.authenticateUser);
router.get("/", product_controller_1.listProducts);
router.get("/:id", product_controller_1.getProduct);
router.post("/", upload.array("images", 6), product_controller_1.createProduct);
router.put("/:id", upload.array("images", 4), product_controller_1.updateProduct);
router.delete("/bulk", product_controller_1.bulkDeleteProducts);
router.delete("/:id", product_controller_1.deleteProduct);
router.patch("/:id/toggle-default", product_controller_1.toggleDefault);
router.patch("/:id/toggle-active", product_controller_1.toggleActive);
router.post("/:id/images", upload.array("images", 4), product_controller_1.uploadImages);
router.delete("/:id/images", product_controller_1.deleteImages);
exports.default = router;
//# sourceMappingURL=product.routes.js.map