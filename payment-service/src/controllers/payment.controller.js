import Razorpay from "razorpay";
import Payment from "../models/payment.model.js";
import crypto from "crypto";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function createOrder(req, res) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
        status: "failed",
      });
    }

    const courseServiceUrl = process.env.COURSE_SERVICE_URL;

    const response = await fetch(`${courseServiceUrl}/api/courses/${courseId}`);

    if (!response.ok) {
      return res.status(404).json({
        message: "Course not found",
        status: "failed",
      });
    }

    const result = await response.json();
    const course = result.data || result.course || result;
    const coursePrice = Number(course?.price);

    if (!course || !Number.isFinite(coursePrice) || coursePrice <= 0) {
      return res.status(400).json({
        message: "Course price is invalid or course is free",
        status: "failed",
      });
    }

    const amount = Math.round(coursePrice * 100);

    const order = await razorpay.orders.create({
      amount,
      currency: "INR",
      receipt: `course_${courseId}_${Date.now()}`,
    });

    const payment = await Payment.create({
      studentId: req.user.userId,
      courseId,
      orderId: order.id,
      price: {
        amount: order.amount,
        currency: order.currency,
      },
      status: "PENDING",
    });

    return res.status(201).json({
      message: "Payment order created successfully",
      status: "success",
      data: {
        paymentId: payment._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        courseId,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID,
      },
    });
  } catch (error) {
    console.error("Create order error:", error.message);

    return res.status(500).json({
      message: "Failed to create payment order",
      status: "failed",
    });
  }
}

export async function verifyPayment(req, res) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        message: "All payment details are required",
        status: "failed",
      });
    }

    const payment = await Payment.findOne({
      orderId: razorpay_order_id,
      studentId: req.user.userId,
    });

    if (!payment) {
      return res.status(404).json({
        message: "Payment order not found",
        status: "failed",
      });
    }

    if (payment.status === "COMPLETED") {
      return res.status(200).json({
        message: "Payment already verified",
        status: "success",
      });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    const signaturesMatch =
      expectedSignature.length === razorpay_signature.length &&
      crypto.timingSafeEqual(
        Buffer.from(expectedSignature),
        Buffer.from(razorpay_signature),
      );

    if (!signaturesMatch) {
      return res.status(400).json({
        message: "Invalid payment signature",
        status: "failed",
      });
    }

    // Fetch actual payment details from Razorpay
    const razorpayPayment = await razorpay.payments.fetch(razorpay_payment_id);

    // Confirm payment belongs to this order
    if (razorpayPayment.order_id !== payment.orderId) {
      return res.status(400).json({
        message: "Payment order ID mismatch",
        status: "failed",
      });
    }

    // Confirm amount and currency match our database
    if (
      razorpayPayment.amount !== payment.price.amount ||
      razorpayPayment.currency !== payment.price.currency
    ) {
      return res.status(400).json({
        message: "Payment amount or currency mismatch",
        status: "failed",
      });
    }

    // Only mark captured payments as completed
    if (razorpayPayment.status !== "captured") {
      return res.status(400).json({
        message: "Payment is not captured yet",
        status: "failed",
      });
    }

    payment.paymentId = razorpay_payment_id;
    payment.signature = razorpay_signature;
    payment.status = "COMPLETED";

    await payment.save();

    return res.status(200).json({
      message: "Payment verified successfully",
      status: "success",
      data: {
        paymentId: payment.paymentId,
        courseId: payment.courseId,
        status: payment.status,
      },
    });
  } catch (error) {
    console.error("Payment verification error:", error.message);

    return res.status(500).json({
      message: "Payment verification failed",
      status: "failed",
    });
  }
}
