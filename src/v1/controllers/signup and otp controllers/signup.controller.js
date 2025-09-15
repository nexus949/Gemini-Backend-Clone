import userModel from "../../models/user.model.js";
import { hashPassword } from "../../utils/hashPass.js";

export async function signup(req, res){
    try{
        const { phone, name, password } = req.body;
        if(!phone) return res.status(400).json({ message: "phone number is required !" });

        //check if user already exists
        if(await userModel.findOne({ where: { phone: phone }})) return res.status(409).json({ message: "User already exists for this phone number ! " });

        //hash the incoming password
        const hashedPassword = await hashPassword(password);

        //create new user and save in db
        const newUser = await userModel.create({
            phone: phone,
            password: hashedPassword,
            name: name || null
        });

        res.status(200).json({ message: "User Created Successfully ! Please Login via OTP !" });
    }
    catch(error){
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}
