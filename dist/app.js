"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const key_1 = require("./core/middleware/key");
const routes_1 = __importDefault(require("./routes"));
const requestLogger_1 = require("./core/help/logs/requestLogger");
const path_1 = __importDefault(require("path"));
const jobs_1 = require("./core/jobs");
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const corsOptions = {
    origin: ["http://localhost:3000", "http://localhost:3333/", "https://dashbord-seven-sigma.vercel.app"],
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
app.use((0, helmet_1.default)());
app.use((0, compression_1.default)());
app.options("*", (0, cors_1.default)(corsOptions));
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
(0, jobs_1.startCleanupJobWithTimeout)();
exports.default = app;
//# sourceMappingURL=app.js.map