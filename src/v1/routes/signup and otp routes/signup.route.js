import express from "express";

const router = express.Router();

import { signup } from "../../controllers/signup and otp controllers/signup.controller.js";

router.post("/auth/signup", signup);

export default router;
