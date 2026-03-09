import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import WatchCard from "../shared/WatchCard";

export default function WatchSection({ title, subtitle, watches, categoryLink, onAddToCart }) {
  if (!watches || watches.length === 0) return null;

  return (
    <section className="bg-background py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {subtitle && (
              <p className="text-gold tracking-[0.3em] uppercase text-xs mb-3">{subtitle}</p>
            )}
            <h2 className="text-2xl md:text-4xl text-foreground font-light tracking-tight">{title}</h2>
          </motion.div>
          {categoryLink && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link
                to={categoryLink}
                className="group hidden md:flex items-center gap-2 text-muted-foreground hover:text-gold text-sm tracking-wide transition-colors"
              >
                View All
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {watches.map((watch, i) => (
            <WatchCard key={watch.id} watch={watch} index={i} onAddToCart={onAddToCart} />
          ))}
        </div>

        {/* Mobile View All */}
        {categoryLink && (
          <div className="mt-10 text-center md:hidden">
            <Link
              to={categoryLink}
              className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors text-sm tracking-wide"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
