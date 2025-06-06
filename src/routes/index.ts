// src/routes/index.ts

import express from "express";
import userRouter from "../domains/user/auth/user.route";
import userDetailRoutes from "../domains/user/userDetail/userDetail.route" 
import userBankRoutes from "../domains/user/userBank/userBank.route";
import noteAndTerms from "../domains/user/noteAndTerms/noteAndTerms.route";

const router = express.Router();

// We mount the user auth flows under /auth
router.use("/auth", userRouter);
router.use("/user-detail", userDetailRoutes);  
router.use("/user-banks", userBankRoutes);   
router.use("/note-terms", noteAndTerms);   



// You can mount other domain routers similarly (e.g. /products, /customers, etc.)
export default router;