import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { checkStaticToken } from "./core/middleware/key";
import routes from "./routes";
import { requestLogger } from "./core/help/logs/requestLogger";
import path from "path";
import bodyParser from "body-parser"; 

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Middleware to parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

const corsOptions = {
  origin: ["http://localhost:5173", "https://dashbord-seven-sigma.vercel.app"], // your frontend URL
  credentials: true, // <— allow cookies
};

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "..", "views"));


app.use(requestLogger);
// app.use(checkStaticToken);
app.use(cookieParser());


app.use("/api/v1", routes);

export default app;
