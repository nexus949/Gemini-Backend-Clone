import jwt from "jsonwebtoken";
import { config } from "../../../config/config.js";

export async function verifyJWT(req, res, next) {
    try {
        if (!req.headers.authorization) throw new Error("No valid Bearer Token in auth header !");
        const token = req.headers.authorization.split(" ")[1];

        req.user = null; //set req.user header as null

        if (token) {
            try {
                //if there is a token verify and if valid store it in req.user and call next !
                const decoded = jwt.verify(token, config.JWT_SECRET_KEY);
                req.user = decoded;
                next();
            }
            catch (error) {
                //error verifying token means the token is invalid - end req res cycle !
                console.log("Error while verifying token: ", error);
                res.status(401).json({ message: "You are not authorized ! ❌" });
            }
        }
    }
    catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export function generateJWT(payload, expiry) {
    return jwt.sign(payload, config.JWT_SECRET_KEY, { expiresIn: `${expiry}` });
}
