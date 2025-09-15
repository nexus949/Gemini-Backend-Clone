import express from "express";
import { verifyJWT } from "../../middlewares/auth.js";

const router = express.Router();

import {

    subscribeToPro,
    stripeWebhook,
    getSubscriptionStatus

} from "../../controllers/payment controllers/payment.controller.js";

router.post("/subscribe/pro", verifyJWT, subscribeToPro);
router.post("/webhook/stripe", express.raw({ type: 'application/json' }), stripeWebhook);
router.get("/subscription/status", verifyJWT, getSubscriptionStatus);

export default router;
