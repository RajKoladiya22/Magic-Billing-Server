"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_route_1 = __importDefault(require("../domains/user/auth/user.route"));
const userDetail_route_1 = __importDefault(require("../domains/user/userDetail/userDetail.route"));
const userBank_route_1 = __importDefault(require("../domains/user/userBank/userBank.route"));
const noteAndTerms_route_1 = __importDefault(require("../domains/user/noteAndTerms/noteAndTerms.route"));
const units_routes_1 = __importDefault(require("../domains/units/units.routes"));
const categories_routes_1 = __importDefault(require("../domains/user/categories/categories.routes"));
const product_routes_1 = __importDefault(require("../domains/user/product/product.routes"));
const customColumn_router_1 = __importDefault(require("../domains/user/customColumn/customColumn.router"));
const customer_routes_1 = __importDefault(require("../domains/user/customer/customer.routes"));
const bill_routes_1 = __importDefault(require("../domains/user/bill/bill.routes"));
const router = express_1.default.Router();
router.use("/auth", user_route_1.default);
router.use("/user-detail", userDetail_route_1.default);
router.use("/user-banks", userBank_route_1.default);
router.use("/note-terms", noteAndTerms_route_1.default);
router.use("/units", units_routes_1.default);
router.use("/categories", categories_routes_1.default);
router.use("/product", product_routes_1.default);
router.use("/custom-columns", customColumn_router_1.default);
router.use("/customers", customer_routes_1.default);
router.use("/bills", bill_routes_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map