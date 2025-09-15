import express from "express";
import { verifyJWT } from "../../middlewares/auth.js";

const router = express.Router();

import {
    forgotPassword,
    changePassword,
    getUserData
} from "../../controllers/signup and otp controllers/passwords.controller.js";

router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/change-password", verifyJWT, changePassword);
router.get("/user/me", verifyJWT, getUserData);

export default router;
