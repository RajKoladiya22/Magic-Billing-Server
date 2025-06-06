"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const units_controller_1 = require("./units.controller");
const router = (0, express_1.Router)();
router.get("/", units_controller_1.getAllUnits);
router.get("/:id", units_controller_1.getUnitById);
router.post("/", units_controller_1.createUnit);
router.put("/:id", units_controller_1.updateUnit);
router.delete("/:id", units_controller_1.deleteUnit);
router.post("/bulk", units_controller_1.createUnitsBulk);
router.delete("/bulk", units_controller_1.deleteUnitsBulk);
exports.default = router;
//# sourceMappingURL=units.routes.js.map