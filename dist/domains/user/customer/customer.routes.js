"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("../../../core/middleware/jwt");
const customer_controller_1 = require("./customer.controller");
const router = (0, express_1.Router)();
router.use(jwt_1.authenticateUser);
router.get("/", customer_controller_1.listCustomers);
router.get("/:id", customer_controller_1.getCustomer);
router.post("/", customer_controller_1.createCustomer);
router.put("/:id", customer_controller_1.updateCustomer);
router.delete("/bulk", customer_controller_1.bulkDeleteCustomers);
router.delete("/:id", customer_controller_1.deleteCustomer);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map