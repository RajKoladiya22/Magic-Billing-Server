import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
// import path from "path";
// import fs from "fs";

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "https://dashbord-seven-sigma.vercel.app"], // your frontend URL
  credentials: true, // <— allow cookies
};

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions));

app.use(express.json());



app.use(cookieParser(/* optional secret for signed cookies */));
app.use("/api/v1", (req, res, next) => {
    res.status(200).json({ message: "API is working!" });
    next();
});       

export default app;
