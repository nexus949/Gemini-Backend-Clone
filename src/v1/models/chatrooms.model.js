import { db } from "../../../config/config.js";
import { DataTypes } from "sequelize";

const chatModel = db.define("chatrooms_metadata", {
    chatroom_id: {
        type: DataTypes.STRING,
        primaryKey: true,
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
});

export default chatModel;
