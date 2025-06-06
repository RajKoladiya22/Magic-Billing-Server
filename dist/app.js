"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const routes_1 = __importDefault(require("./routes"));
const requestLogger_1 = require("./core/help/logs/requestLogger");
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: ["http://localhost:5173", "https://dashbord-seven-sigma.vercel.app"],
    credentials: true,
};
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, "..", "views"));
app.use(requestLogger_1.requestLogger);
app.use((0, cookie_parser_1.default)());
app.use("/api/v1", routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map