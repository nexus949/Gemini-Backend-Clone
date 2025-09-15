import express from "express";
import { verifyJWT } from "../../middlewares/auth.js";
import { AIprompt } from "../../utils/aiPrompt.js";

const router = express.Router();

import {

    createChatRoom,
    sendMessage,
    getAllChatRooms,
    getChatRoomDetail,
    getLatestMessage,
    getAllMessages

} from "../../controllers/chatrooms controllers/chatrooms.controller.js";

router.post("/chatroom", verifyJWT, createChatRoom);
router.post("/chatroom/:id/message", verifyJWT, sendMessage);
router.get("/chatroom/", verifyJWT, getAllChatRooms);
router.get("/chatroom/:id", verifyJWT, getChatRoomDetail);
router.get("/chatroom/:id/message", verifyJWT, getLatestMessage);
router.get("/chatroom/:id/message/all", verifyJWT, getAllMessages);

export default router;
