import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { ShieldCheck, Lock, ArrowLeft, Sparkles, CreditCard, RefreshCw } from "lucide-react";

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
          color: "#f97316", // Sheryians Orange Accent Match
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
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <div className="flex items-center gap-3 text-orange-500 font-bold text-lg animate-pulse">
          <Sparkles className="w-6 h-6" /> Loading checkout...
        </div>
      </div>
    );
  }

  if (error && !course) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex flex-col items-center justify-center font-sans space-y-4 px-6">
        <p className="text-red-400 font-medium text-sm">{error}</p>
        <button onClick={() => navigate(-1)} className="text-xs text-neutral-400 hover:text-orange-500 flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Go Back
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-[#0B0B0B] text-white min-h-screen flex items-center justify-center font-sans">
        <p className="text-neutral-400">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0B0B0B] text-white min-h-screen font-sans px-6 lg:px-16 py-16 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-8">
        
        {/* Header Title */}
        <div className="text-center space-y-2">
          <span className="text-orange-500 text-xs font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> SECURE CHECKOUT
          </span>
          <h1 className="text-3xl font-black tracking-tight text-white">Complete Your Enrollment</h1>
          <p className="text-xs text-neutral-400">Review course summary and complete test-mode payment via Razorpay.</p>
        </div>

        {/* Checkout Card Container */}
        <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xl">
          
          <div className="space-y-3 border-b border-neutral-800/80 pb-6">
            <span className="bg-orange-500/10 text-orange-400 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
              {course.category || "Course"}
            </span>
            <h2 className="text-xl font-bold text-white">{course.title}</h2>
            <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">{course.description}</p>
          </div>

          {/* Amount Breakdown */}
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex items-center justify-between">
            <span className="text-xs text-neutral-400 uppercase tracking-wider font-semibold">Total Payable</span>
            <span className="text-2xl font-black text-white">
              {Number(course.price) === 0 ? "Free" : `₹${Number(course.price).toLocaleString("en-IN")}`}
            </span>
          </div>

          {/* Error Banner */}
          {error && (
            <div role="alert" className="bg-red-500/10 border border-red-500/20 text-red-400 p-3.5 rounded-xl text-xs font-medium text-center">
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              type="button"
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-4 rounded-xl text-sm transition-all duration-300 shadow-xl shadow-orange-600/20 hover:scale-[1.01] flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handlePayment}
              disabled={paying || course.price <= 0}
            >
              <CreditCard className="w-4 h-4" />
              {paying ? "Processing Payment..." : `Pay ₹${course.price}`}
            </button>

            <button
              type="button"
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white border border-neutral-800 font-semibold py-3 rounded-xl text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              onClick={handleRetryEnrollment}
              disabled={paying}
            >
              <RefreshCw className="w-3.5 h-3.5 text-orange-500" />
              {paying ? "Checking status..." : "Already Paid? Retry Enrollment"}
            </button>
          </div>

          {/* Secure Footer Note */}
          <div className="pt-4 border-t border-neutral-800/80 flex items-center justify-center gap-2 text-[11px] text-neutral-500 text-center">
            <ShieldCheck className="w-4 h-4 text-orange-500 flex-shrink-0" />
            <span>This checkout uses Razorpay test-mode payments only.</span>
          </div>

        </div>

      </div>
    </div>
  );
}