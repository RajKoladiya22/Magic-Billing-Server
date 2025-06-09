// src/routes/index.ts

import express from "express";
import userRouter from "../domains/user/auth/user.route";
import userDetailRoutes from "../domains/user/userDetail/userDetail.route" 
import userBankRoutes from "../domains/user/userBank/userBank.route";
import noteAndTerms from "../domains/user/noteAndTerms/noteAndTerms.route";
import unitRoutes from "../domains/units/units.routes";
import categoryRoutes from "../domains/user/categories/categories.routes";
import productRoutes from "../domains/user/product/product.routes";
import customColumns from "../domains/user/customColumn/customColumn.router";
import customersRouter from "../domains/user/customer/customer.routes"; 
import billsRouter from "../domains/user/bill/bill.routes";

const router = express.Router();

// We mount the user auth flows under /auth
router.use("/auth", userRouter);
router.use("/user-detail", userDetailRoutes);  
router.use("/user-banks", userBankRoutes);   
router.use("/note-terms", noteAndTerms);   
router.use("/units", unitRoutes);
router.use("/categories", categoryRoutes);
router.use("/product", productRoutes);
router.use("/custom-columns", customColumns);
router.use("/customers", customersRouter);
router.use("/bills", billsRouter);


// You can mount other domain routers similarly (e.g. /products, /customers, etc.)
export default router;