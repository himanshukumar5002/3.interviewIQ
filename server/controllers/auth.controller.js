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
        
        // Determine if we're on production or development
        const isProduction = process.env.NODE_ENV === "production";
        const protocol = req.protocol || "https";
        
        console.log("Setting cookie - isProduction:", isProduction, "Protocol:", protocol);
        
        res.cookie("token", token, {
            httpOnly: true,
            secure: isProduction, // true on production, false on dev
            sameSite: isProduction ? "none" : "lax", // "none" for cross-origin on production
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
            path: "/",
            domain: isProduction ? ".onrender.com" : undefined // Allow subdomains on production
        });
        
        console.log("Cookie set successfully");
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
        const isProduction = process.env.NODE_ENV === "production";
        
        res.clearCookie("token", {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            path: "/",
            domain: isProduction ? ".onrender.com" : undefined
        });
        console.log("User logged out, cookie cleared");
        return res.status(200).json({ message: "LogOut Successfully" });
    } catch (error) {
        console.error("Logout error:", error);
        return res.status(500).json({ message: `Logout error: ${error.message}` });
    }
}