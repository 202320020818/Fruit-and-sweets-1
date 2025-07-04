import express from "express";
import {
  deleteUser,
  getUser,
  getUsers,
  signout,
  test,
  updateUser,
} from "../controllers/user.controller.js";
import { verifyToken } from "../utils/verifyUser.js";

import { getActiveUsers } from "../controllers/user.controller.js";
import { getUserGrowth } from "../controllers/user.controller.js";

const router = express.Router();

router.get("/active-users", verifyToken, getActiveUsers);
router.get("/user-growth", verifyToken, getUserGrowth);


router.get("/test", test);
router.put("/update/:userId", verifyToken, updateUser);
router.delete("/delete/:userId", verifyToken, deleteUser);
router.post("/signout", signout);
router.get("/getusers", verifyToken, getUsers);
router.get("/:userId", getUser);

export default router;
