"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_router_1 = __importDefault(require("../domains/user/user.router"));
const userDetail_routes_1 = __importDefault(require("../domains/userDetail/userDetail.routes"));
const router = express_1.default.Router();
router.use("/auth", user_router_1.default);
router.use("/user-detail", userDetail_routes_1.default);
;
exports.default = router;
//# sourceMappingURL=index.js.map