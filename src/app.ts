import express from "express";
import cors from "cors";
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from "cookie-parser";
import { checkStaticToken } from "./core/middleware/key";
import routes from "./routes";
import { requestLogger } from "./core/help/logs/requestLogger";
import path from "path";
import {startCleanupJobWithTimeout} from './core/jobs'

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ["http://localhost:5173", "https://dashbord-seven-sigma.vercel.app"], // your frontend URL
  credentials: true, // <— allow cookies
};
app.use(helmet());
app.use(compression());
// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));

const whitelist = [
  "/api/v1/auth/reset-password",
];


app.use(requestLogger);
app.use(checkStaticToken(whitelist));
app.use(cookieParser());
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && "body" in err) {
    return res.status(400).json({ success: false, message: "Invalid JSON payload." });
  }
  next();
});


app.use("/api/v1", routes);
startCleanupJobWithTimeout();

export default app;
