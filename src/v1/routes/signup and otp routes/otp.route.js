import express from "express";

const router = express.Router();

import {
    sendOTP,
    verifyOTP
} from "../../controllers/signup and otp controllers/otp.controller.js";

router.post("/auth/send-otp", sendOTP);
router.post("/auth/verify-otp", verifyOTP);

export default router;
