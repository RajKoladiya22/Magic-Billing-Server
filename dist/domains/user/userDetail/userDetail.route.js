"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userDetail_controller_1 = require("./userDetail.controller");
const jwt_1 = require("../../../core/middleware/jwt");
const router = (0, express_1.Router)();
router.use(jwt_1.authenticateUser);
router.get("/", userDetail_controller_1.getUserDetailHandler);
router.post("/", userDetail_controller_1.createOrUpdateUserDetailHandler);
router.put("/", userDetail_controller_1.updateUserDetailHandler);
exports.default = router;
//# sourceMappingURL=userDetail.route.js.map