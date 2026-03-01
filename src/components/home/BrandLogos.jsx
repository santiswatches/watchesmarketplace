import React from "react";
import { motion } from "framer-motion";

const brands = [
  { name: "Rolex", letter: "R" },
  { name: "Omega", letter: "Ω" },
  { name: "Tag Heuer", letter: "TH" },
  { name: "Cartier", letter: "C" },
  { name: "Breitling", letter: "B" },
  { name: "Patek Philippe", letter: "PP" },
];

export default function BrandLogos({ onBrandClick }) {
  return (
    <section className="bg-[#0A0A0A] py-20 border-y border-white/5">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-[#C9A962] tracking-[0.3em] uppercase text-xs mb-12"
        >
          Authorized Dealers
        </motion.p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
          {brands.map((brand, index) => (
            <motion.button
              key={brand.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onBrandClick?.(brand.name)}
              className="group flex flex-col items-center gap-3 py-6 hover:bg-white/[0.02] rounded-lg transition-all duration-300"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-white/10 group-hover:border-[#C9A962]/40 flex items-center justify-center transition-all duration-300">
                <span className="text-white/50 group-hover:text-[#C9A962] text-lg md:text-xl font-light tracking-wider transition-colors duration-300">
                  {brand.letter}
                </span>
              </div>
              <span className="text-white/40 group-hover:text-white/70 text-[10px] md:text-xs tracking-[0.2em] uppercase transition-colors duration-300">
                {brand.name}
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
}
