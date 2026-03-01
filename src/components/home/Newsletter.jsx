import React, { useState } from "react";
import { motion } from "framer-motion";
import { Send } from "lucide-react";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setEmail("");
    }
  };

  return (
    <section className="bg-[#0F0F0F] py-24">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto"
        >
          <p className="text-[#C9A962] tracking-[0.3em] uppercase text-xs mb-4">Stay Updated</p>
          <h2 className="text-2xl md:text-3xl text-white font-light tracking-tight mb-3">
            Join Our World
          </h2>
          <p className="text-white/40 text-sm font-light leading-relaxed mb-8">
            Be the first to discover new arrivals, exclusive offers, and the stories behind our timepieces.
          </p>

          {submitted ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[#C9A962] text-sm"
            >
              Thank you for subscribing. Welcome to our world.
            </motion.p>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-0 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/5 border border-white/10 border-r-0 px-5 py-3.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-[#C9A962]/40 transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-[#C9A962] px-6 flex items-center justify-center hover:bg-[#D4B870] transition-colors"
              >
                <Send className="w-4 h-4 text-[#0A0A0A]" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
