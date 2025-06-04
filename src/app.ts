import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { checkStaticToken } from "./core/middleware/key";
import routes from "./routes";

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://dashbord-seven-sigma.vercel.app"], // your frontend URL
  credentials: true, // <— allow cookies
};

// app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

app.use(express.json());
// app.use(requestLogger);
app.use(checkStaticToken);

app.use(cookieParser());


app.use("/api/v1", routes);

export default app;
