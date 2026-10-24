import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Checkout() {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      try {
       const response = await api.get(`/courses/${courseId}`);
        setCourse(response.data.course);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load course details.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  async function handleRetryEnrollment() {
    try {
      setPaying(true);
      setError("");

      const response = await api.post("/payments/retry-enrollment", {
        courseId,
      });


      if (response.data.status === "success") {
        alert("Enrollment successful! Your course is ready.");
        navigate("/my-courses");
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Enrollment retry failed. Please check the server logs.",
      );
    } finally {
      setPaying(false);
    }
  }

  async function handlePayment() {
    try {
      setPaying(true);
      setError("");

      // Step 1: Create Razorpay order
      const orderResponse = await api.post("/payments/create-order", {
        courseId,
      });

      const order = orderResponse.data.data || orderResponse.data;

      if (!order.orderId || !order.amount || !order.razorpayKeyId) {
        throw new Error("Invalid order response from Payment Service.");
      }

      // Step 2: Open Razorpay Checkout
      const options = {
        key: order.razorpayKeyId,
        amount: order.amount,
        currency: order.currency || "INR",
        name: "LearnHub",
        description: course.title,
        order_id: order.orderId,

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await api.post("/payments/verify-payment", {
              ...paymentResponse
            });

            if (
              verifyResponse.data.status === "success" ||
              verifyResponse.data.success === true
            ) {
              alert("Payment successful! You can now access your course.");
              navigate("/my-courses");
            } else {
              setError(
                verifyResponse.data.message || "Payment verification failed.",
              );
            }
          } catch (err) {
            setError(
              err.response?.data?.message ||
                "Payment verification failed. Please check My Learning before retrying.",
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: function () {
            setPaying(false);
          },
        },

        theme: {
          color: "#5145cd",
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        setError(
          response.error?.description || "Payment failed. Please try again.",
        );
        setPaying(false);
      });

      razorpay.open();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to start payment.",
      );
      setPaying(false);
    }
  }

  if (loading) {
    return (
      <main className="page">
        <h2>Loading checkout...</h2>
      </main>
    );
  }

  if (error && !course) {
    return (
      <main className="page">
        <p>{error}</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="page">
        <p>Course not found.</p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Checkout</h1>

      <article className="course-card">
        <span className="course-category">{course.category || "Course"}</span>

        <h2>{course.title}</h2>
        <p>{course.description}</p>

        <h3>Amount: ₹{course.price}</h3>

        {error && (
          <p role="alert" style={{ color: "red" }}>
            {error}
          </p>
        )}

        <button
          className="primary-button"
          onClick={handlePayment}
          disabled={paying || course.price <= 0}
        >
          {paying ? "Processing..." : `Pay ₹${course.price}`}
        </button>
        <button
          type="button"
          onClick={handleRetryEnrollment}
          disabled={paying}
          style={{ marginLeft: 12 }}
        >
          {paying ? "Checking..." : "Retry Enrollment"}
        </button>

        <p style={{ marginTop: 12 }}>
          This checkout uses Razorpay. Use test-mode payment details only.
        </p>
      </article>
    </main>
  );
}
