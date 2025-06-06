"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categories_controller_1 = require("./categories.controller");
const router = (0, express_1.Router)();
const jwt_1 = require("../../../core/middleware/jwt");
router.use(jwt_1.authenticateUser);
router.get("/", categories_controller_1.getAllCategories);
router.get("/:id", categories_controller_1.getCategoryById);
router.post("/", categories_controller_1.createCategory);
router.post("/bulk", categories_controller_1.createCategoriesBulk);
router.put("/:id", categories_controller_1.updateCategory);
router.delete("/:id", categories_controller_1.deleteCategory);
router.delete("/bulk", categories_controller_1.deleteCategoriesBulk);
exports.default = router;
//# sourceMappingURL=categories.routes.js.map