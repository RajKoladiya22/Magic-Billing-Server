import { RequestHandler, Router } from "express";
import {
  createOrUpdateUserDetailHandler,
  getUserDetailHandler,
  updateUserDetailHandler,
} from "./userDetail.controller";
import { authenticateUser } from "../../../core/middleware/jwt";

const router = Router();

router.use(authenticateUser as RequestHandler);

router.get("/", getUserDetailHandler);
router.post("/", createOrUpdateUserDetailHandler);
router.put("/", updateUserDetailHandler);

export default router;
