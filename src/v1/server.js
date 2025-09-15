import express from "express";
import { config } from "../../config/config.js";
import { db } from "../../config/config.js";

//import models and sync tables
import "./models/models.associations.js";
(
    async function(){
        await db.sync({ alter: true });
        console.log("Synced all Tables Successfully !");
    }
)();

//import route middlewares
import _signup from "./routes/signup and otp routes/signup.route.js";
import _otp from "./routes/signup and otp routes/otp.route.js";
import _passwords from "./routes/signup and otp routes/passwords.route.js";
import _payments from "./routes/payment routes/payment.route.js";
import _chatrooms from "./routes/chatrooms routes/chatrooms.route.js";

const app = express();

app.listen(config.SERVER_PORT, function(){
    console.log(`Server Running on port ${ config.SERVER_PORT } ! 🚀`);
});


//mount base middlewares
app.use(express.urlencoded({ extended: true }));
app.use("/v1/", _payments); //mount the payment route middleware because express.json() tampers the stripe webhook signature.
app.use(express.json());

//mount route middlewares
app.use("/v1/", _signup);
app.use("/v1/", _otp);
app.use("/v1/", _passwords);
app.use("/v1/", _chatrooms);

app.get("/v1/", (req, res) =>{
    try{
        res.status(200).json({ message: "Welcome to Gemini Backend Clone ! 👋🏼" });
    }
    catch(error){
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
})
