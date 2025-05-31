// src/routes/index.ts

import express from "express";
import userRouter from "../domains/user/user.router";

const router = express.Router();

// We mount the user auth flows under /auth
router.use("/auth", userRouter);



// You can mount other domain routers similarly (e.g. /products, /customers, etc.)
export default router;
