import React from "react";
import { motion } from "framer-motion";
import { Star, StarHalf } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchReviewStats } from "@/services/reviews";

const WATCHES = [
  {
    src: "/assets/watches/ap_black_dial-removebg-preview.png",
    alt: "Audemars Piguet",
    style: { top: "-2%", left: "10%", width: "clamp(190px, 17vw, 250px)", transform: "rotate(-6deg)" },
    delay: 0.07,
  },
  {
    src: "/assets/watches/green_dial_datejust_rolex-removebg-preview.png",
    alt: "Rolex Datejust",
    style: { top: "-30%", left: "53%", width: "clamp(195px, 17vw, 255px)", transform: "rotate(4deg)" },
    delay: 0.15,
  },
  {
    src: "/assets/watches/cartier_santos_white_dial-removebg-preview.png",
    alt: "Cartier Santos",
    style: { top: "48%", left: "14%", width: "clamp(185px, 17vw, 245px)", transform: "rotate(2deg)" },
    delay: 0.11,
  },
  {
    src: "/assets/watches/patek_nautilus-removebg-preview.png",
    alt: "Patek Nautilus",
    style: { top: "5%", right: "5%", width: "clamp(190px, 17vw, 250px)", transform: "rotate(-3deg)" },
    delay: 0.2,
  },
  {
    src: "/assets/watches/panda_daytona-removebg-preview.png",
    alt: "Rolex Panda Daytona",
    style: { bottom: "-5%", right: "16%", width: "clamp(190px, 17vw, 250px)", transform: "rotate(-2deg)" },
    delay: 0.25,
  },
];

const SHADOW = { filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.10))" };

function DynamicStars({ average }) {
  const full = Math.floor(average);
  const hasHalf = average - full >= 0.3;
  const empty = 5 - full - (hasHalf ? 1 : 0);

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(full)].map((_, i) => (
        <Star key={`f${i}`} className="w-4 h-4 fill-amber-gold text-amber-gold" />
      ))}
      {hasHalf && (
        <StarHalf className="w-4 h-4 fill-amber-gold text-amber-gold" />
      )}
      {[...Array(empty)].map((_, i) => (
        <Star key={`e${i}`} className="w-4 h-4 fill-none text-amber-gold/30" />
      ))}
    </div>
  );
}

export default function HeroBanner() {
  const { data: stats } = useQuery({
    queryKey: ["review-stats"],
    queryFn: fetchReviewStats,
    staleTime: 5 * 60 * 1000,
  });

  const average = stats?.average || 5;
  const count = stats?.count || 0;

  return (
    <section className="relative bg-cream overflow-hidden" style={{ minHeight: "100vh" }}>

      {/* ── DESKTOP ── */}

      {/* Watch layer */}
      <div
        className="hidden md:block absolute left-0 right-0 bottom-0"
        style={{ top: "4rem" }}
      >
        {WATCHES.map((w, i) => (
          <motion.img
            key={i}
            src={w.src}
            alt={w.alt}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: w.delay, duration: 0.75, ease: "easeOut" }}
            className="absolute object-contain select-none pointer-events-none"
            style={{ ...w.style, ...SHADOW }}
          />
        ))}
      </div>

      {/* Text layer — centered */}
      <div
        className="hidden md:flex absolute left-0 right-0 bottom-0 items-center justify-center z-10"
        style={{ top: "4rem" }}
      >
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex flex-col items-center text-center"
          style={{ maxWidth: "420px" }}
        >
          <p className="text-[12px] font-bold tracking-[0.25em] uppercase text-accent-orange mb-5">
            Don't waste your time
          </p>

          <h1
            className="font-extrabold uppercase text-warm-black leading-[0.88] tracking-tight"
            style={{ fontSize: "clamp(2.2rem, 3.4vw, 3.8rem)" }}
          >
            Discover the perfect timepiece for you
          </h1>

          <p className="mt-5 text-sm font-light tracking-wide text-muted-warm leading-relaxed" style={{ maxWidth: "300px" }}>
            Brand new and certified pre-owned exclusive watches, sourced from reputable dealers.
          </p>

          <div className="mt-6 flex flex-col items-center gap-1.5">
            <DynamicStars average={average} />
            {count > 0 && (
              <p className="text-xs text-muted-warm">
                {average.toFixed(1)} from {count} review{count !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* ── MOBILE — stacked ── */}
      <div className="md:hidden flex flex-col items-center text-center px-6 pt-24 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="flex flex-col items-center"
        >
          <p className="text-[12px] font-bold tracking-[0.25em] uppercase text-accent-orange mb-5">
            Don't waste your time
          </p>
          <h1 className="text-4xl font-extrabold uppercase text-warm-black leading-[0.9] tracking-tight">
            Discover the perfect timepiece for you
          </h1>
          <p className="mt-5 text-sm font-light text-muted-warm max-w-[280px] mx-auto leading-relaxed">
            Brand new and certified pre-owned exclusive watches, sourced from reputable dealers.
          </p>
          <div className="mt-5 flex flex-col items-center gap-1">
            <DynamicStars average={average} />
            {count > 0 && (
              <p className="text-xs text-muted-warm">
                {average.toFixed(1)} from {count} review{count !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </motion.div>

        <motion.img
          src="/assets/watches/panda_daytona-removebg-preview.png"
          alt="Rolex Panda Daytona"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="w-52 object-contain mt-10 select-none"
          style={SHADOW}
        />
      </div>

    </section>
  );
}
