import User from "../models/user.model.js"


export const getCurrentUser = async (req,res) => {
    try {
        console.log("Current-user request:")
        console.log("  Cookies:", req.cookies)
        console.log("  Headers:", req.headers)
        console.log("  UserId from token:", req.userId)
        
        const userId = req.userId
        
        // If no user ID, user is not logged in
        if(!userId){
            console.log("  No userId found - user not logged in")
            return res.status(200).json(null)
        }
        
        const user = await User.findById(userId)
        if(!user) {
            console.log("  User not found in database")
            return res.status(404).json({message:"user does not found"})
        }
        
        console.log("  User found:", user.email)
        return res.status(200).json(user)
    } catch (error) {
         console.error("getCurrentUser error:", error)
         return res.status(500).json({message:`failed to get currentUser ${error}`})
    }
}