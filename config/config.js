import dotenv from "dotenv";
dotenv.config();

import { Sequelize } from "sequelize";
import Stripe from "stripe";

//initialize connection to db
const sequelize = new Sequelize(
    process.env.DB_NAME || "postgres",
    process.env.DB_USER || "postgres",
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST || "localhost",
        port: process.env.DB_PORT || 5432,
        dialect: "postgres",
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        },
        logging: false
    }
);

//Test connection with IIFE
(
    async function () {
        try {
            await sequelize.authenticate();
            console.log("Connected to Database successfully.");
        }
        catch (error) {
            console.error("Connection to Database Failed: ", error);
        }
    }
)();

export const db = sequelize;
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const config = {

    SERVER_PORT: process.env.SERVER_PORT || 3000,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY,
    PRO_PRICE_ID: process.env.PRO_PRICE_ID,
    STRIPE_WEBHOOK_SIGNING_SECRET: process.env.STRIPE_WEBHOOK_SIGNING_SECRET,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
    UPSTASH_URL: process.env.UPSTASH_URL,

};
