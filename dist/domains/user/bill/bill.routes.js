"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("../../../core/middleware/jwt");
const bill_controller_1 = require("./bill.controller");
const router = (0, express_1.Router)();
router.use(jwt_1.authenticateUser);
router.get("/", bill_controller_1.listBills);
router.get("/:id", bill_controller_1.getBill);
router.post("/", bill_controller_1.createBill);
router.put("/:id", bill_controller_1.updateBill);
router.delete("/bulk", bill_controller_1.bulkDeleteBills);
router.delete("/:id", bill_controller_1.deleteBill);
exports.default = router;
//# sourceMappingURL=bill.routes.js.map