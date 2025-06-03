import { Router } from "express";
import {
  createOrUpdateUserDetailHandler,
  getUserDetailHandler,
  updateUserDetailHandler,
} from "../userDetail/userDetail.controller";
import { authenticateUser } from "../../core/middleware/jwt";

const router = Router();

router.use(authenticateUser);

router.get("/", getUserDetailHandler);
router.post("/", createOrUpdateUserDetailHandler);
router.put("/", updateUserDetailHandler);

export default router;
