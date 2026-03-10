import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function FeaturedBanner() {
  return (
    <section className="bg-background py-16">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="relative overflow-hidden rounded-sm min-h-[400px] md:min-h-[500px]">
          <img
            src="https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=1600&q=80"
            alt="Limited collection"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-background/30" />
          <div className="relative z-10 flex items-center h-full min-h-[400px] md:min-h-[500px] px-8 md:px-16">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-lg"
            >
              <p className="text-gold tracking-[0.3em] uppercase text-xs mb-4">
                Limited Edition
              </p>
              <h2 className="text-3xl md:text-5xl text-foreground font-light leading-tight">
                Exclusive
                <br />
                <span className="italic">Timepieces</span>
              </h2>
              <p className="mt-4 text-muted-foreground text-sm font-light leading-relaxed">
                Rare finds for the discerning collector. Each piece is numbered and comes
                with a certificate of authenticity.
              </p>
              <Link
                to={createPageUrl("shop") + "?category=limited_edition"}
                className="mt-8 group inline-flex items-center gap-3 border border-gold text-gold px-8 py-3 text-xs tracking-[0.15em] uppercase font-medium hover:bg-gold hover:text-primary-foreground transition-all duration-300"
              >
                Explore Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
