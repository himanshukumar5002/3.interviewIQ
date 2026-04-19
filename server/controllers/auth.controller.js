import genToken from "../config/token.js"
import User from "../models/user.model.js"


export const googleAuth = async (req,res) => {
    try {
        const {name , email} = req.body
        console.log("Google auth request:", { name, email })
        
        let user = await User.findOne({email})
        if(!user){
            user = await User.create({
                name , 
                email
            })
            console.log("New user created:", user)
        } else {
            console.log("Existing user found:", user)
        }
        
        let token = await genToken(user._id)
        res.cookie("token" , token , {
            httpOnly:true,
            secure:false,
            sameSite:"lax",
            maxAge:7 * 24 * 60 * 60 * 1000
        })

        console.log("Sending user response:", user)
        return res.status(200).json(user)

    } catch (error) {
        console.error("Google auth error:", error)
        return res.status(500).json({message:`Google auth error ${error}`})
    }
    
}

export const logOut = async (req,res) => {
    try {
        await res.clearCookie("token")
        return res.status(200).json({message:"LogOut Successfully"})
    } catch (error) {
         return res.status(500).json({message:`Logout error ${error}`})
    }
    
}