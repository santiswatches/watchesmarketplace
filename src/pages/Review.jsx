import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fetchReviewByToken, submitReview } from "@/services/reviews";

function StarPicker({ value, onChange }) {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            className={`w-8 h-8 transition-colors ${
              star <= (hover || value)
                ? "fill-amber-gold text-amber-gold"
                : "fill-none text-warm-border"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function Review() {
  const token = new URLSearchParams(window.location.search).get("token");

  const [state, setState] = useState("loading"); // loading | form | submitting | success | error | expired
  const [reviewData, setReviewData] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  // Form fields
  const [rating, setRating] = useState(0);
  const [testimonial, setTestimonial] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => {
    if (!token) {
      setErrorMsg("No review token provided.");
      setState("error");
      return;
    }

    fetchReviewByToken(token)
      .then((data) => {
        setReviewData(data);
        setCustomerName(data.customer_name || "");
        setPurchaseDate(data.purchase_date || "");
        setState("form");
      })
      .catch((err) => {
        if (err.status === 410) {
          setState("expired");
        } else {
          setErrorMsg(err.message || "This review link is invalid.");
          setState("error");
        }
      });
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (rating === 0) {
      setFormError("Please select a star rating.");
      return;
    }
    if (!testimonial.trim()) {
      setFormError("Please write your experience.");
      return;
    }

    setState("submitting");
    try {
      await submitReview(token, {
        rating,
        testimonial: testimonial.trim(),
        customer_name: customerName.trim() || undefined,
        purchase_date: purchaseDate || undefined,
      });
      setState("success");
    } catch (err) {
      setFormError(err.message);
      setState("form");
    }
  };

  return (
    <div className="min-h-screen bg-offwhite flex flex-col">
      {/* Minimal branded header */}
      <header className="py-6 text-center">
        <h1 className="font-extrabold text-warm-black tracking-tight text-xl uppercase">
          Santi's<span className="block text-[10px] font-medium tracking-[0.3em] text-muted-warm">Watches</span>
        </h1>
      </header>

      <main className="flex-1 flex items-start justify-center px-4 pb-16 pt-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-lg"
        >
          {/* Loading */}
          {state === "loading" && (
            <div className="bg-white rounded-2xl border border-warm-border p-10 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-muted-warm mx-auto" />
              <p className="mt-4 text-sm text-muted-warm">Loading your review...</p>
            </div>
          )}

          {/* Error */}
          {state === "error" && (
            <div className="bg-white rounded-2xl border border-warm-border p-10 text-center">
              <AlertCircle className="w-10 h-10 text-red-400 mx-auto" />
              <h2 className="mt-4 text-lg font-semibold text-warm-black">Invalid Link</h2>
              <p className="mt-2 text-sm text-muted-warm">{errorMsg}</p>
            </div>
          )}

          {/* Already submitted */}
          {state === "expired" && (
            <div className="bg-white rounded-2xl border border-warm-border p-10 text-center">
              <CheckCircle className="w-10 h-10 text-accent-orange mx-auto" />
              <h2 className="mt-4 text-lg font-semibold text-warm-black">Already Submitted</h2>
              <p className="mt-2 text-sm text-muted-warm">This review has already been submitted. Thank you!</p>
            </div>
          )}

          {/* Success */}
          {state === "success" && (
            <div className="bg-white rounded-2xl border border-warm-border p-10 text-center">
              <CheckCircle className="w-10 h-10 text-accent-orange mx-auto" />
              <h2 className="mt-4 text-lg font-semibold text-warm-black">Thank You!</h2>
              <p className="mt-2 text-sm text-muted-warm">
                Your feedback means a lot to us. We appreciate you taking the time to share your experience.
              </p>
            </div>
          )}

          {/* Form */}
          {(state === "form" || state === "submitting") && (
            <div className="bg-white rounded-2xl border border-warm-border p-8">
              <div className="text-center mb-8">
                <h2 className="text-xl font-bold text-warm-black">Share Your Experience</h2>
                {reviewData?.product_name && (
                  <p className="mt-2 text-sm text-muted-warm">
                    {reviewData.product_brand && `${reviewData.product_brand} `}{reviewData.product_name}
                  </p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Star Rating */}
                <div className="flex flex-col items-center gap-2">
                  <Label className="text-sm font-medium text-warm-black">How would you rate your experience?</Label>
                  <StarPicker value={rating} onChange={setRating} />
                </div>

                {/* Testimonial */}
                <div className="space-y-2">
                  <Label htmlFor="testimonial" className="text-sm font-medium text-warm-black">
                    Your Review
                  </Label>
                  <Textarea
                    id="testimonial"
                    value={testimonial}
                    onChange={(e) => setTestimonial(e.target.value)}
                    placeholder="Tell us about your experience with this timepiece..."
                    className="min-h-[120px] resize-none border-warm-border focus:ring-accent-orange"
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-warm text-right">{testimonial.length}/2000</p>
                </div>

                {/* Customer Name */}
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-warm-black">Your Name</Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John D."
                    className="border-warm-border focus:ring-accent-orange"
                  />
                </div>

                {/* Purchase Date */}
                <div className="space-y-2">
                  <Label htmlFor="date" className="text-sm font-medium text-warm-black">Date of Purchase</Label>
                  <Input
                    id="date"
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    className="border-warm-border focus:ring-accent-orange"
                  />
                </div>

                {formError && (
                  <p className="text-sm text-red-500 text-center">{formError}</p>
                )}

                <Button
                  type="submit"
                  disabled={state === "submitting"}
                  className="w-full bg-accent-orange hover:bg-accent-orange/90 text-white font-semibold py-3 rounded-xl"
                >
                  {state === "submitting" ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Submitting...</>
                  ) : (
                    "Submit Review"
                  )}
                </Button>
              </form>
            </div>
          )}
        </motion.div>
      </main>

      {/* Minimal footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-muted-warm">&copy; {new Date().getFullYear()} Santi's Watches. All rights reserved.</p>
      </footer>
    </div>
  );
}
