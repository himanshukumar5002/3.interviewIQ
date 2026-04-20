import jwt from "jsonwebtoken"

const isAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        console.log("isAuth middleware - cookies available:", Object.keys(req.cookies));
        console.log("isAuth middleware - token:", token ? "present" : "missing");

        if (!token) {
            console.log("isAuth: No token found, user not authenticated");
            req.userId = null;
            return next();
        }

        try {
            const verifyToken = jwt.verify(token, process.env.JWT_SECRET);

            if (!verifyToken) {
                console.log("isAuth: Token verification failed");
                req.userId = null;
                return next();
            }

            console.log("isAuth: Token verified, userId:", verifyToken.userId);
            req.userId = verifyToken.userId;
            next();
        } catch (jwtError) {
            console.error("JWT verification error:", jwtError.message);
            req.userId = null;
            next();
        }
    } catch (error) {
        console.error("isAuth error:", error.message);
        req.userId = null;
        next();
    }
};

export default isAuth;