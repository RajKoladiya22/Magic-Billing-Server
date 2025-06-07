import { Router } from "express";
import multer from "multer";
import { authenticateUser } from "../../../core/middleware/jwt";
import {
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  bulkDeleteProducts,
  toggleDefault,
  toggleActive,
  uploadImages,
  deleteImages,
} from "./product.controller";

const upload = multer({ dest: "/tmp" });
const router = Router();

router.use(authenticateUser);

router.get("/", listProducts);
router.get("/:id", getProduct);
router.post("/", upload.array("images", 6), createProduct);
router.put("/:id", upload.array("images", 4), updateProduct);
router.delete("/bulk", bulkDeleteProducts);
router.delete("/:id", deleteProduct);
router.patch("/:id/toggle-default", toggleDefault);
router.patch("/:id/toggle-active", toggleActive);
router.post("/:id/images", upload.array("images", 4), uploadImages);
router.delete("/:id/images", deleteImages);

export default router;

