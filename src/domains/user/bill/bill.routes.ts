import { Router } from "express";
import { authenticateUser } from "../../../core/middleware/jwt";
import {
  listBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  bulkDeleteBills,
} from "./bill.controller";

const router = Router();
router.use(authenticateUser);

router.get("/", listBills);
router.get("/:id", getBill);
router.post("/", createBill);
router.put("/:id", updateBill);
router.delete("/bulk", bulkDeleteBills);
router.delete("/:id", deleteBill);

export default router;
