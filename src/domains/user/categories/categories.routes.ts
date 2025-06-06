import { Router } from "express";
import {
  getAllCategories,
  getCategoryById,
  createCategory,
  createCategoriesBulk,
  updateCategory,
  deleteCategory,
  deleteCategoriesBulk,
} from "./categories.controller";

const router = Router();
import { authenticateUser } from '../../../core/middleware/jwt';

router.use(authenticateUser);

// Fetch all (with optional search)
router.get("/", getAllCategories);

// Fetch one by ID
router.get("/:id", getCategoryById);

// Create a single category
router.post("/", createCategory);

// Bulk‐create categories
router.post("/bulk", createCategoriesBulk);

// Update a single category
router.put("/:id", updateCategory);

// Delete a single category
router.delete("/:id", deleteCategory);

// Bulk‐delete categories
router.delete("/bulk", deleteCategoriesBulk);

export default router;
