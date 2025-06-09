import { Router } from "express";
import { authenticateUser } from "../../../core/middleware/jwt";
import {
  listCustomColumns,
  getCustomColumn,
  createCustomColumn,
  updateCustomColumn,
  deleteCustomColumn,
  bulkDeleteCustomColumns,
} from "./customColumn.controller";

const router = Router();
router.use(authenticateUser);

router.get("/", listCustomColumns);
router.get("/:id", getCustomColumn);
router.post("/", createCustomColumn);
router.put("/:id", updateCustomColumn);
router.delete("/bulk", bulkDeleteCustomColumns);
router.delete("/:id", deleteCustomColumn);

export default router;
