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
    <section className="bg-card py-24 border-t border-border/50">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-xl mx-auto"
        >
          <p className="text-gold tracking-[0.3em] uppercase text-xs mb-4">Stay Updated</p>
          <h2 className="text-2xl md:text-3xl text-foreground font-light tracking-tight mb-3">
            Join Our World
          </h2>
          <p className="text-muted-foreground text-sm font-light leading-relaxed mb-8">
            Be the first to discover new arrivals, exclusive offers, and the stories behind our timepieces.
          </p>

          {submitted ? (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-gold text-sm"
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
                className="flex-1 bg-background/50 border border-border px-5 py-3.5 text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-gold transition-colors"
                required
              />
              <button
                type="submit"
                className="bg-gold px-6 flex items-center justify-center hover:bg-gold-light transition-colors"
              >
                <Send className="w-4 h-4 text-primary-foreground" />
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  );
}
