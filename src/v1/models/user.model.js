import { db } from "../../../config/config.js";
import { DataTypes } from "sequelize";

const userModel = db.define("user", {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subscriptionTier: {
        type: DataTypes.STRING,
        defaultValue: "Basic", // Basic or Pro
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    otp:{
        type: DataTypes.STRING,
        allowNull: true
    },
    otpExpiresAt: {
        type: DataTypes.DATE,
        allowNull: true
    }
});

export default userModel;
