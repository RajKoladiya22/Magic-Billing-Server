import { Router } from "express";
import {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
  deleteUnit,
  createUnitsBulk,
  deleteUnitsBulk,
} from "./units.controller";

const router = Router();

router.get("/", getAllUnits);
router.get("/:id", getUnitById);
router.post("/", createUnit);
router.put("/:id", updateUnit);
router.delete("/:id", deleteUnit);

router.post("/bulk", createUnitsBulk);
router.delete("/bulk", deleteUnitsBulk);

export default router;
