import express from "express";
import { receiveWebhook } from "../controllers/webhookController.js";

const router = express.Router();

router.post("/:token", receiveWebhook);

export default router;