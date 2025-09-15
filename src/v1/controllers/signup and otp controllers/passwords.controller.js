import userModel from "../../models/user.model.js";
import { verifyPassword, hashPassword } from "../../utils/hashPass.js";
import { genOTP } from "../../utils/otpGen.js";
import { passwordOTPCache } from "../../utils/cache.js";

/**
 * There is a forgot password enpoint which does not require auth to get a password change OTP.
 * This will break in setup where I am returning the OTP just as a response but will work in tradition mobile based setups.
 * There is a password-change enpoint that changes password and this requires Auth.
 * I integrated OTP check here entering the OTP from the unaunthenticated route will work here but there should have been a option to get OTP for password change while authenticated.
 * The Design choice is not perfect but leans towards secure approach if done correctly.
*/

export async function forgotPassword(req, res) {
    try {
        const { phone } = req.body;

        if (!phone) return res.status(400).json({ message: "Phone number is required to reset password !" });
        const user = await userModel.findOne({ where: { phone: phone } });
        if (!user) return res.status(404).json({ message: "No valid user found with this phone number !" });

        //generate OTP and cache it
        const otp = genOTP();
        passwordOTPCache.set("password-change-OTP", otp);

        res.status(200).json({
            message: `Your Password Reset OTP is ${otp}, Valid for only 5 minutes !`,
            thought: "This endpoint seems too insecure because if I can just get an OTP for password reset like this I can reset password of any account. Although this setup does work in a real SMS based OTP system."
        });
    }
    catch (error) {
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}
export async function changePassword(req, res) {
    try{
        //get phone number from JWT payload (stored as phone)
        const phone = req.user.phone;
        const { oldPassword, newPassword, confNewPassword, passwordChangeOTP } = req.body;

        if(!oldPassword || !newPassword || !confNewPassword || !passwordChangeOTP)
            return res.status(400).json({ message: "New and Old Passwords are required alongside password change OTP !" });

        //get OTP from cache and verify
        const cachedOTP = passwordOTPCache.get("password-change-OTP");

        // debug
        // console.log(cachedOTP);
        // console.log(passwordChangeOTP);
        // console.log(typeof cachedOTP);
        // console.log(typeof passwordChangeOTP);

        //loose equality because cachedOTP is number and passwordChange OTP is string
        if(passwordChangeOTP != cachedOTP || !cachedOTP)
            return res.status(401).json({ message: "OTP does not match or has expired try to get a new OTP" });

        //once otp is verified clear it from the cache
        passwordOTPCache.del("password-change-OTP");

        if(newPassword !== confNewPassword)
            return res.status(400).json({ message: "Both new passwords should match !" });

        //check if old password is same as new password
        if(newPassword === oldPassword)
            return res.status(400).json({ message: "New Password Cannot be the same as old password" });

        const user = await userModel.findOne({ where: { phone: phone } });

        //Although the user will be valid as the JWT is verified
        // but in some edge cases where the user might delete or change his phone number then identification by phone wont happen.
        if(!user) return res.status(404).json({ message: "No valid user found for this phone number !" });

        if(!await verifyPassword(user.password, oldPassword))
            return res.status(401).json({ message: "Old Password is incorrect !" });

        //hash new password and update the user
        user.password = await hashPassword(newPassword);
        await user.save();

        res.status(200).json({ message: "Password Changed Successfully !" });
    }
    catch(error){
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}

export async function getUserData(req, res){
    try{
        const phone = req.user.phone;
        if(!phone)
            return res.status(404).json({ message: "No valid User found !" });

        const user = await userModel.findOne({ where: { phone: phone } });

        res.status(200).json({
            id: user.id,
            phone: user.phone,
            name: user.name,
            subscription_tier: user.subscriptionTier,
            user_registered_at: user.createdAt
        });
    }
    catch(error){
        console.log("Server Error: ", error);
        res.status(500).json({ message: "Internal Server Error ! 🤕" });
    }
}
