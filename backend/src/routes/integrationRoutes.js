import express from "express";
import { protect } from "../../middlewares/authMiddleware.js";
import {
  connectGithub,
  githubCallback,
  listIntegrations,
  disconnectIntegration,
  connectDiscord,
  connectGmail,
  googleCallback,
} from "../controllers/integrationController.js";

const router = express.Router();

router.get("/github/callback", githubCallback);
router.get("/google/callback", googleCallback);

router.use(protect);

router.get("/github/connect", connectGithub);
router.post("/discord/connect", connectDiscord);
router.get("/gmail/connect", connectGmail);
router.get("/", listIntegrations);
router.delete("/:provider", disconnectIntegration);

export default router;