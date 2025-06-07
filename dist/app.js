"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const key_1 = require("./core/middleware/key");
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
const whitelist = [
    "/api/v1/auth/reset-password",
];
app.use(requestLogger_1.requestLogger);
app.use((0, key_1.checkStaticToken)(whitelist));
app.use((0, cookie_parser_1.default)());
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && "body" in err) {
        return res.status(400).json({ success: false, message: "Invalid JSON payload." });
    }
    next();
});
app.use("/api/v1", routes_1.default);
exports.default = app;
//# sourceMappingURL=app.js.map