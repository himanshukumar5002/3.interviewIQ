import Payment from "../models/payment.model.js";
import User from "../models/user.model.js";
import razorpay from "../services/razorpay.service.js";
import crypto from "crypto"

export const createOrder = async (req, res) => {
  try {
    console.log("Create order request - userId:", req.userId);
    
    const { planId, amount, credits } = req.body;
    
    console.log("Create order request:", { planId, amount, credits, userId: req.userId });
    
    if (!req.userId) {
      console.error("User not authenticated");
      return res.status(401).json({ message: "User not authenticated. Please login first." });
    }
    
    if (!amount || !credits) {
      return res.status(400).json({ message: "Invalid plan data - amount and credits required" });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    console.log("Razorpay order created:", order.id);

    await Payment.create({
      userId: req.userId,
      planId,
      amount,
      credits,
      razorpayOrderId: order.id,
      status: "created",
    });

    console.log("Payment record created in DB");
    return res.json(order);
    
  } catch (error) {
    console.error("Create order error:", error.message);
    console.error("Stack:", error.stack);
    return res.status(500).json({ message: `Failed to create Razorpay order: ${error.message}` });
  }
}

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    console.log("Verify payment request:", { razorpay_order_id, razorpay_payment_id });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment verification data" });
    }

    const body = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Signature mismatch");
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      console.error("Payment record not found:", razorpay_order_id);
      return res.status(404).json({ message: "Payment not found" });
    }

    if (payment.status === "paid") {
      console.log("Payment already processed:", razorpay_order_id);
      return res.json({ message: "Already processed" });
    }

    // Update payment record
    payment.status = "paid";
    payment.razorpayPaymentId = razorpay_payment_id;
    await payment.save();
    console.log("Payment marked as paid:", razorpay_order_id);

    // Add credits to user
    const updatedUser = await User.findByIdAndUpdate(payment.userId, {
      $inc: { credits: payment.credits }
    }, { new: true });

    console.log("Credits added to user:", payment.userId, "Credits:", payment.credits);

    res.json({
      success: true,
      message: "Payment verified and credits added",
      user: updatedUser,
    });

  } catch (error) {
    console.error("Verify payment error:", error.message);
    return res.status(500).json({ message: `Failed to verify Razorpay payment: ${error.message}` });
  }
}