import React from "react";

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
    <section className="bg-offwhite py-20 border-y border-warm-border">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <p className="text-center text-accent-orange tracking-[0.3em] uppercase text-xs mb-12 font-semibold">
          Authorized Dealers
        </p>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-8">
          {brands.map((brand) => (
            <button
              key={brand.name}
              onClick={() => onBrandClick?.(brand.name)}
              className="group flex flex-col items-center gap-3 py-6 hover:bg-white rounded-xl transition-colors duration-300"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border border-warm-border group-hover:border-accent-orange flex items-center justify-center transition-colors duration-300">
                <span className="text-muted-warm group-hover:text-accent-orange text-lg md:text-xl font-light tracking-wider transition-colors duration-300">
                  {brand.letter}
                </span>
              </div>
              <span className="text-muted-warm group-hover:text-warm-black text-[11px] md:text-xs tracking-[0.2em] uppercase transition-colors duration-300">
                {brand.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}