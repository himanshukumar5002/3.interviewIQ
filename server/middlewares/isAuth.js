import jwt from "jsonwebtoken"


const isAuth = async (req,res,next) => {
    try {
        let {token} = req.cookies
        console.log("isAuth middleware - cookies available:", Object.keys(req.cookies))
        console.log("isAuth middleware - token:", token ? "present" : "missing")

        if(!token){
            console.log("isAuth: No token found, user not authenticated")
            req.userId = null
            return next()
        }
        
        const verifyToken = jwt.verify(token , process.env.JWT_SECRET)
        
        if(!verifyToken){
            console.log("isAuth: Token verification failed")
            return res.status(400).json({message:"user does not have a valid token"})
        }
        
        console.log("isAuth: Token verified, userId:", verifyToken.userId)
        req.userId = verifyToken.userId

        next()
   

    } catch (error) {
        console.error("isAuth error:", error.message)
        req.userId = null
        return next()
    }
    
}

export default isAuth