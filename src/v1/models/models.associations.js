import userModel from "./user.model.js";
import chatModel from "./chatrooms.model.js";
import messageModel from "./messages.model.js";
import { DataTypes } from "sequelize";

//reference to user table using foreign key
userModel.hasMany(chatModel, { foreignKey: "user_id" });
chatModel.belongsTo(userModel, { foreignKey: "user_id" });

//reference to chatrooms_metadata table using foreign key
chatModel.hasMany(messageModel, {
  foreignKey: {
    name: "chatroom_id",
    type: DataTypes.STRING
  }
});
messageModel.belongsTo(chatModel, {
  foreignKey: {
    name: "chatroom_id",
    type: DataTypes.STRING
  }
});

export { userModel, chatModel, messageModel };
