import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import WatchCard from "../shared/WatchCard";

export default function WatchSection({ title, subtitle, watches, categoryLink, onAddToCart, altBg = false }) {
  if (!watches || watches.length === 0) return null;

  return (
    <section className={`${altBg ? "bg-offwhite" : "bg-white"} py-20 md:py-28`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            {subtitle && (
              <p className="font-sans text-[11px] font-semibold tracking-widest uppercase text-accent-orange mb-3">{subtitle}</p>
            )}
            <h2 className="font-condensed text-3xl md:text-5xl font-bold uppercase tracking-tight text-warm-black">{title}</h2>
          </motion.div>
          {categoryLink && (
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <Link
                to={categoryLink}
                className="group hidden md:flex items-center gap-2 text-muted-warm hover:text-accent-orange text-xs font-semibold tracking-widest uppercase transition-colors"
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
              className="inline-flex items-center gap-2 text-accent-orange text-xs font-semibold tracking-widest uppercase transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
