import express from "express"
import isAuth from "../middlewares/isAuth.js"
import { createOrder, verifyPayment } from "../controllers/payment.controller.js"

// Async error wrapper
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

const paymentRouter = express.Router()

paymentRouter.post("/order", isAuth, asyncHandler(createOrder))
paymentRouter.post("/verify", isAuth, asyncHandler(verifyPayment))

export default paymentRouter