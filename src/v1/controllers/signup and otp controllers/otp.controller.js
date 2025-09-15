import userModel from "../../models/user.model.js";
import { verifyPassword } from "../../utils/hashPass.js";
import { genOTP } from "../../utils/otpGen.js";
import { generateJWT } from "../../middlewares/auth.js";
import { cacheUser } from "../../utils/cache.js";

export async function sendOTP(req, res) {
    try {
        const { phone, password } = req.body;

        if (!phone || !password) return res.status(400).json({ message: "Phone Number and Password are required !" });
        const user = await userModel.findOne({ where: { phone: phone } });

        //check if user exists or not
        if (!user) return res.status(404).json({ message: "No valid user found with this phone number !" });

        //check if password is correct or not
        if (!await verifyPassword(user.password, password)) return res.status(401).json({ message: "Invalid Password !" });

        //generate OTP and store the OTP in db with expiration time i.e. 5 mins from now
        const otp = genOTP();
        await userModel.update(
            {
                otp: otp,
                otpExpiresAt: Date.now() + 5 * 60 * 1000
            },
            { where: { phone: phone } }
        );

        res.status(200).json({ message: `Your OTP is ${otp}, Valid for only 5 minutes !` });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function verifyOTP(req, res) {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) return res.status(400).json({ message: "Phone Number and OTP are required !" });
        const user = await userModel.findOne({ where: { phone: phone } });

        //check if user exists or not
        if (!user) return res.status(404).json({ message: "No valid user found with this phone number !" });

        //check if user entered the correct OTP or not
        if(user.otp !== otp) return res.status(401).json({ message: "Invalid OTP Entered !" });

        //check if the otp is still valid or not
        if(Date.now() > user.otpExpiresAt) return res.status(401).json({ message: "OTP Timed Out !" });

        //clear the old OTP
        user.otp = null;
        user.otpExpiresAt = null;
        await user.save();

        cacheUser.set("_user", {
            id: user.dataValues.id,
            phone: user.dataValues.phone,
            name: user.dataValues.name,
            subscription_tier: user.dataValues.subscriptionTier
        })

        //if everything is fine, create a payload and generate a JWT
        const payload = {
            sub: user.id,
            phone: user.phone,
        };

        const token = generateJWT(payload, "20m");
        res.status(200).json({
            message: "Auth Successful",
            token: token
        });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}
