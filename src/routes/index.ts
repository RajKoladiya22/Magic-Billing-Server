// src/routes/index.ts

import express from "express";
import userRouter from "../domains/user/user.router";
import userDetailRoutes from "../domains/userDetail/userDetail.routes" 

const router = express.Router();

// We mount the user auth flows under /auth
router.use("/auth", userRouter);
router.use("/user-detail", userDetailRoutes);;



// You can mount other domain routers similarly (e.g. /products, /customers, etc.)
export default router;