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

    const response = await fetch(
      `${courseServiceUrl}/api/courses/${courseId}`
    );

    if (!response.ok) {
      return res.status(404).json({
        message: "Course not found",
        status: "failed",
      });
    }

    const result = await response.json();
    const course = result.data || result.course || result;
    const coursePrice = Number(course?.price);

    if (
      !course ||
      !Number.isFinite(coursePrice) ||
      coursePrice <= 0
    ) {
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
    console.log("VERIFY PAYMENT CALLED");

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
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

    // Verify signature and payment details.
    // If already completed, don't require another payment.
    if (payment.status !== "COMPLETED") {
      const expectedSignature = crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

      const signaturesMatch =
        expectedSignature.length === razorpay_signature.length &&
        crypto.timingSafeEqual(
          Buffer.from(expectedSignature),
          Buffer.from(razorpay_signature)
        );

      if (!signaturesMatch) {
        return res.status(400).json({
          message: "Invalid payment signature",
          status: "failed",
        });
      }

      const razorpayPayment = await razorpay.payments.fetch(
        razorpay_payment_id
      );

      if (
        razorpayPayment.order_id !== payment.orderId ||
        razorpayPayment.amount !== payment.price.amount ||
        razorpayPayment.currency !== payment.price.currency ||
        razorpayPayment.status !== "captured"
      ) {
        return res.status(400).json({
          message: "Payment verification failed",
          status: "failed",
        });
      }

      payment.paymentId = razorpay_payment_id;
      payment.signature = razorpay_signature;
      payment.status = "COMPLETED";
      await payment.save();
    }

    // For an already completed payment, retry enrollment.
    console.log(
      "CREATING ENROLLMENT FOR:",
      payment.courseId.toString()
    );

    const learningServiceUrl =
      process.env.LEARNING_SERVICE_URL ||
      "http://localhost:3003";

    const enrollmentResponse = await fetch(
      `${learningServiceUrl}/api/learning/enroll`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.cookie || "",
        },
        body: JSON.stringify({
          courseId: payment.courseId.toString(),
        }),
      }
    );

    const enrollmentResult = await enrollmentResponse.json();

    // Duplicate enrollment is acceptable.
    if (
      !enrollmentResponse.ok &&
      enrollmentResponse.status !== 409
    ) {
      console.error(
        "Enrollment creation failed:",
        enrollmentResult
      );

      return res.status(502).json({
        message:
          enrollmentResult.message ||
          "Payment is completed, but enrollment failed. Please retry.",
        status: "enrollment_failed",
        paymentStatus: payment.status,
      });
    }

    return res.status(200).json({
      message:
        enrollmentResponse.status === 409
          ? "Payment verified; enrollment already exists"
          : "Payment verified and enrollment confirmed",
      status: "success",
      data: {
        paymentId: payment.paymentId,
        courseId: payment.courseId,
        paymentStatus: payment.status,
        enrollment:
          enrollmentResult.data || enrollmentResult,
      },
    });
  } catch (error) {
    console.error(
      "Payment verification error:",
      error.message
    );

    return res.status(500).json({
      message: "Payment verification failed",
      status: "failed",
    });
  }
}
export async function retryEnrollment(req, res) {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({
        message: "Course ID is required",
        status: "failed",
      });
    }

    // Only use a completed payment belonging to this student.
    const payment = await Payment.findOne({
      studentId: req.user.userId,
      courseId,
      status: "COMPLETED",
    });

    if (!payment) {
      return res.status(404).json({
        message: "No completed payment found for this course",
        status: "failed",
      });
    }

    const learningServiceUrl =
      process.env.LEARNING_SERVICE_URL ||
      "http://localhost:3003";

    const response = await fetch(
      `${learningServiceUrl}/api/learning/enroll`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          cookie: req.headers.cookie || "",
        },
        body: JSON.stringify({
          courseId: payment.courseId.toString(),
        }),
      }
    );

    const result = await response.json();

    if (response.status === 409) {
      return res.status(200).json({
        message: "Enrollment already exists",
        status: "success",
      });
    }

    if (!response.ok) {
      console.error("Retry enrollment failed:", result);

      return res.status(502).json({
        message: result.message || "Enrollment retry failed",
        status: "enrollment_failed",
      });
    }

    return res.status(200).json({
      message: "Course enrollment successful",
      status: "success",
      data: result.data || result,
    });
  } catch (error) {
    console.error("Retry enrollment error:", error.message);

    return res.status(500).json({
      message: "Unable to retry enrollment",
      status: "failed",
    });
  }
}

export async function getInstructorEarnings(req, res) {
  try {
    const courseServiceUrl = process.env.COURSE_SERVICE_URL;

    if (!courseServiceUrl) {
      return res.status(500).json({
        message: "Course Service URL is missing",
        status: "failed",
      });
    }

    // Get courses belonging to the logged-in instructor.
    const coursesResponse = await fetch(
      `${courseServiceUrl}/api/courses/my`,
      {
        headers: {
          cookie: req.headers.cookie || "",
        },
      }
    );

    if (!coursesResponse.ok) {
      return res.status(502).json({
        message: "Unable to fetch instructor courses",
        status: "failed",
      });
    }

    const coursesResult = await coursesResponse.json();
    const courses = coursesResult.courses || [];
    const courseIds = new Set(
      courses.map((course) => String(course._id))
    );

    // Only verified, completed payments for these courses count.
    const payments = await Payment.find({
      status: "COMPLETED",
      courseId: { $in: [...courseIds] },
    }).sort({ createdAt: -1 });

    const earningsByCourse = new Map();

    for (const course of courses) {
      earningsByCourse.set(String(course._id), {
        courseId: String(course._id),
        title: course.title,
        price: Number(course.price) || 0,
        totalSales: 0,
        totalEarnings: 0,
      });
    }

    for (const payment of payments) {
      const item = earningsByCourse.get(String(payment.courseId));

      if (item) {
        item.totalSales += 1;
        item.totalEarnings += Number(payment.price?.amount || 0) / 100;
      }
    }

    const courseEarnings = [...earningsByCourse.values()];
    const totalSales = courseEarnings.reduce(
      (sum, course) => sum + course.totalSales,
      0
    );
    const totalEarnings = courseEarnings.reduce(
      (sum, course) => sum + course.totalEarnings,
      0
    );

    return res.status(200).json({
      status: "success",
      message: "Instructor earnings fetched successfully",
      data: {
        totalSales,
        totalEarnings,
        currency: "INR",
        courses: courseEarnings,
      },
    });
  } catch (error) {
    console.error("Get instructor earnings error:", error.message);

    return res.status(500).json({
      message: "Failed to fetch instructor earnings",
      status: "failed",
    });
  }
}