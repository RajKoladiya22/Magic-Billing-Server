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
const router = express_1.default.Router();
router.use("/auth", user_route_1.default);
router.use("/user-detail", userDetail_route_1.default);
router.use("/user-banks", userBank_route_1.default);
router.use("/note-terms", noteAndTerms_route_1.default);
exports.default = router;
//# sourceMappingURL=index.js.map