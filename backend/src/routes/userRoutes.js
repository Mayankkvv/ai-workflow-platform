import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import { getMe, updateProfile, changePassword } from "../controllers/userController.js";

const router = express.Router();

router.use(protect);

router.get("/me", getMe);
router.patch("/me", updateProfile);
router.put("/me/password", changePassword);

export default router;