import genToken from "../config/token.js"
import User from "../models/user.model.js"

export const googleAuth = async (req, res) => {
    try {
        const { name, email } = req.body;
        console.log("Google auth request:", { name, email });
        
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                name,
                email
            });
            console.log("New user created:", user);
        } else {
            console.log("Existing user found:", user);
        }
        
        let token = await genToken(user._id);
        console.log("Token generated:", token.substring(0, 20) + "...");
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: "/"
        });
        
        console.log("Cookie set - Protocol:", req.protocol, "Secure:", process.env.NODE_ENV === "production");
        console.log("Sending user response:", user);
        
        return res.status(200).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            credits: user.credits
        });

    } catch (error) {
        console.error("Google auth error:", error);
        return res.status(500).json({ message: `Google auth error: ${error.message}` });
    }
}

export const logOut = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/"
        });
        console.log("User logged out, cookie cleared");
        return res.status(200).json({ message: "LogOut Successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: `Logout error: ${error.message}` });
    }
}