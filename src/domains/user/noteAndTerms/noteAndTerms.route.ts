import express from "express";
import {
  createHandler,
  listHandler,
  detailHandler,
  updateHandler,
  deleteHandler,
} from "./noteAndTerms.controller";
import { authenticateUser } from "../../../core/middleware/jwt";

const router = express.Router();
router.use(authenticateUser); // All routes require auth

router.post("/", createHandler);
router.get("/", listHandler);
router.get("/:id", detailHandler);
router.put("/:id", updateHandler);
router.delete("/:id", deleteHandler);

export default router;
