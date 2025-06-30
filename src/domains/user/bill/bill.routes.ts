import { Router } from "express";
import { authenticateUser } from "../../../core/middleware/jwt";
import {
  listBills,
  getBill,
  createBill,
  updateBill,
  deleteBill,
  bulkDeleteBills,
  downloadInvoicePdf,
} from "./bill.controller";

const router = Router();
router.use(authenticateUser);

router.get("/", listBills);
router.get("/:id", getBill);
router.post("/", createBill);
router.put("/:id", updateBill);
router.delete("/bulk", bulkDeleteBills);
router.delete("/:id", deleteBill);
router.get("/:id/pdf", downloadInvoicePdf);

export default router;
