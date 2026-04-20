import express from "express"
import { googleAuth, logOut } from "../controllers/auth.controller.js"

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const authRouter = express.Router()

authRouter.post("/google", asyncHandler(googleAuth))
authRouter.get("/logout", asyncHandler(logOut))

export default authRouter