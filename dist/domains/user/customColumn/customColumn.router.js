"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("../../../core/middleware/jwt");
const customColumn_controller_1 = require("./customColumn.controller");
const router = (0, express_1.Router)();
router.use(jwt_1.authenticateUser);
router.get("/", customColumn_controller_1.listCustomColumns);
router.get("/:id", customColumn_controller_1.getCustomColumn);
router.post("/", customColumn_controller_1.createCustomColumn);
router.put("/:id", customColumn_controller_1.updateCustomColumn);
router.delete("/bulk", customColumn_controller_1.bulkDeleteCustomColumns);
router.delete("/:id", customColumn_controller_1.deleteCustomColumn);
exports.default = router;
//# sourceMappingURL=customColumn.router.js.map