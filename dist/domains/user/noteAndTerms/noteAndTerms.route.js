"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const noteAndTerms_controller_1 = require("./noteAndTerms.controller");
const jwt_1 = require("../../../core/middleware/jwt");
const router = express_1.default.Router();
router.use(jwt_1.authenticateUser);
router.post("/", noteAndTerms_controller_1.createHandler);
router.get("/", noteAndTerms_controller_1.listHandler);
router.get("/:id", noteAndTerms_controller_1.detailHandler);
router.put("/:id", noteAndTerms_controller_1.updateHandler);
router.delete("/:id", noteAndTerms_controller_1.deleteHandler);
exports.default = router;
//# sourceMappingURL=noteAndTerms.route.js.map