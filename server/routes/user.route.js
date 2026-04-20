import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { getCurrentUser } from "../controllers/user.controller.js"

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const userRouter = express.Router()

userRouter.get("/current-user", isAuth, asyncHandler(getCurrentUser))

export default userRouter