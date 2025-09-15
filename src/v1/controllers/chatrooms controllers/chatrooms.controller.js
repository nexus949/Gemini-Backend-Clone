import chatModel from "../../models/chatrooms.model.js";
import { GeminiRequestQueue } from "../../utils/queue.js";
import { roomCache, cacheUser } from "../../utils/cache.js";
import shortUUID from "short-uuid";
import { db } from "../../../../config/config.js";
import { rateLimiter } from "../../utils/rate-limit.js";
import messageModel from "../../models/messages.model.js";
import userModel from "../../models/user.model.js";

export async function createChatRoom(req, res) {
    try {
        const id = req.user.sub;
        if (!id)
            return res.status(404).json({ message: "No valid user found !" });

        const chatRoomID = shortUUID.generate();
        await chatModel.create({
            chatroom_id: chatRoomID,
            user_id: id
        });

        res.status(200).json({ message: `New Chatroom created with chatroom id: ${chatRoomID}` });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function sendMessage(req, res) {
    try {
        //get user id from req.user
        const user_id = req.user.sub;

        //get chatroom id from request parameters
        const id = req.params.id;
        //get json prompt from request body
        const userPrompt = req.body.userPrompt;
        if (!userPrompt)
            return res.status(400).json({ message: "Prompt to AI is required !" });

        //get user from cache if not query and set in cache for rate limiting
        let user = cacheUser.get("_user");
        if (!user) {
            user = await userModel.findOne({
                where: { id: user_id }
            });
            cacheUser.set("_user", {
                id: user.dataValues.id,
                phone: user.dataValues.phone,
                name: user.dataValues.name,
                subscription_tier: user.dataValues.subscriptionTier
            })
        }

        //rate limit user
        const rateLimitResult = await rateLimiter(user);
        if(!rateLimitResult){
            return res.status(429).json({ error: "Daily limit reached for Basic tier" });
        }

        //add the task to queue
        const result = await GeminiRequestQueue.add("geminiCall", { userPrompt, id });
        res.status(200).json({
            message: "Task Queued Sucessfully",
            View: `View message at making a GET request at /v1/chatroom/${id}/message`
        });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function getAllChatRooms(req, res) {
    try {
        //get user's id from the req.user
        const id = req.user.sub;
        if (!id)
            return res.status(404).json({ message: "No valid user found !" });

        let chatRooms;

        //try to retrieve chatRooms from cache
        chatRooms = roomCache.get(`chatRooms_${id}`);
        if (!chatRooms) {
            console.log("No room data in cache...DB queried !");

            const rooms = await chatModel.findAll({
                where: { user_id: id }
            });

            //dataValues are sub objects of the rooms array with room data,
            // we map only the dataValues and reject any other data
            chatRooms = rooms.map(r => r.dataValues);
            //Cache the rooms
            roomCache.set(`chatRooms_${id}`, chatRooms);
        }

        res.status(200).json({
            all_rooms: chatRooms
        });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function getChatRoomDetail(req, res) {
    try {
        //get user's id from the req.user
        const user_id = req.user.sub;
        if (!user_id)
            return res.status(404).json({ message: "No valid user found !" });

        //get room id from query params
        const roomID = req.params.id;
        const details = await chatModel.findOne({
            where: {
                chatroom_id: roomID,
                user_id: user_id
            }
        });
        const messageCounts = await messageModel.findAll({
            attributes: [
                "role",
                [db.fn("COUNT", db.col("role")), "message_count"]
            ],
            where: {
                chatroom_id: roomID
            },
            group: ["role"],
            raw: true
        });

        res.status(200).json({ details: [details.dataValues, messageCounts] });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function getLatestMessage(req, res) {
    try {
        //get chatroom id from request parameters
        const id = req.params.id;

        const latestMessage = await messageModel.findAll({
            attributes: ["role", "content"],
            where: { chatroom_id: id },
            order: [["createdAt", "DESC"]],
            limit: 2
        })

        res.status(200).json({
            "Latest Message": latestMessage
        })
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function getAllMessages(req, res) {
    try {
        //get chatroom id from request parameters
        const id = req.params.id;

        const allMessages = await messageModel.findAll({
            attributes: ["role", "content"],
            where: { chatroom_id: id },
            order: [["createdAt", "DESC"]],
        })

        res.status(200).json({
            "All Messages": allMessages
        })
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}
