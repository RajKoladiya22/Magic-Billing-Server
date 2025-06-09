import { Router } from "express";
import { authenticateUser } from "../../../core/middleware/jwt";
import {
  listCustomers,
  getCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  bulkDeleteCustomers,
} from "./customer.controller";

const router = Router();
router.use(authenticateUser);

router.get("/", listCustomers);
router.get("/:id", getCustomer);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.delete("/bulk", bulkDeleteCustomers);
router.delete("/:id", deleteCustomer);

export default router;
