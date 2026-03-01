import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroBanner() {
  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden bg-[#0A0A0A]">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=1920&q=80"
          alt="Luxury watch"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0A0A0A] via-[#0A0A0A]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-[#C9A962] tracking-[0.3em] uppercase text-xs md:text-sm font-light mb-6"
            >
              Curated Timepieces
            </motion.p>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-light text-white leading-[1.1] tracking-tight">
              Time, Crafted
              <br />
              <span className="italic font-normal text-[#C9A962]">to Perfection</span>
            </h1>
            <p className="mt-6 text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-lg">
              Discover our exclusive collection of the world's most prestigious timepieces, 
              each telling a story of unparalleled craftsmanship.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Link
                to={createPageUrl("Shop")}
                className="group inline-flex items-center gap-3 bg-[#C9A962] text-[#0A0A0A] px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium hover:bg-[#D4B870] transition-all duration-300"
              >
                Shop Collection
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to={createPageUrl("Shop") + "?category=new_arrival"}
                className="group inline-flex items-center gap-3 border border-white/20 text-white px-8 py-4 text-sm tracking-[0.15em] uppercase font-medium hover:border-[#C9A962] hover:text-[#C9A962] transition-all duration-300"
              >
                New Arrivals
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent" />
    </section>
  );
}
