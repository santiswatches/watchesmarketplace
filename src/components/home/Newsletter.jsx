import React, { useState } from "react";
import { Send, Loader2 } from "lucide-react";

const GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdRi7e7UPgovns8Q3RC8agYhVqcrYLEiUp_pjlj_EqIprjUKw/formResponse";
const EMAIL_ENTRY_ID = "entry.390517773";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append(EMAIL_ENTRY_ID, email);

      await fetch(GOOGLE_FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      setSubmitted(true);
      setEmail("");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-cream py-24 border-t border-warm-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-[11px] font-semibold tracking-widest uppercase text-accent-orange mb-4">
            Stay Updated
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold uppercase text-warm-black tracking-tight mb-3">
            Join Our World
          </h2>
          <p className="text-muted-warm text-sm font-light leading-relaxed mb-8">
            Be the first to discover new arrivals, exclusive offers, and the stories behind our timepieces.
          </p>

          {submitted ? (
            <p className="text-accent-orange text-sm font-medium">
              Thank you for subscribing. Welcome to our world.
            </p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex max-w-md mx-auto shadow-sm">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="flex-1 bg-white border border-warm-border border-r-0 px-5 py-3.5 text-warm-black text-sm placeholder:text-muted-warm focus:outline-none focus:border-accent-orange transition-colors rounded-l-lg disabled:opacity-50"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-warm-black px-6 flex items-center justify-center hover:opacity-90 transition-opacity rounded-r-lg disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 text-white" />
                  )}
                </button>
              </form>
              {error && (
                <p className="text-red-500 text-sm mt-3">{error}</p>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}