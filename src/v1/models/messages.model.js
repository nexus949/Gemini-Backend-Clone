import { db } from "../../../config/config.js";
import { DataTypes } from "sequelize";
import chatModel from "./chatrooms.model.js";

const messageModel = db.define("chatrooms_messages", {
    message_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    role: {
        type: DataTypes.ENUM("user", "assistant"),
        allowNull: false
    },
    content: {
        type: DataTypes.TEXT
    },
    chatroom_id: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

export default messageModel;
