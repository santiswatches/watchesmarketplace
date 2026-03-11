import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const WATCHES = [
  {
    src: "/assets/watches/ap_black_dial-removebg-preview.png",
    alt: "Audemars Piguet",
    brand: "Audemars Piguet",
    style: { top: "-2%", left: "10%", width: "clamp(190px, 17vw, 250px)", transform: "rotate(-6deg)" },
    heartPos: { bottom: "5%", left: "5%" },
    delay: 0.07,
  },
  {
    src: "/assets/watches/green_dial_datejust_rolex-removebg-preview.png",
    alt: "Rolex Datejust",
    brand: "Rolex",
    nameHint: "Datejust",
    style: { top: "-30%", left: "53%", width: "clamp(195px, 17vw, 255px)", transform: "rotate(4deg)" },
    heartPos: { bottom: "5%", right: "5%" },
    delay: 0.15,
  },
  {
    src: "/assets/watches/cartier_santos_white_dial-removebg-preview.png",
    alt: "Cartier Santos",
    brand: "Cartier",
    style: { top: "48%", left: "14%", width: "clamp(185px, 17vw, 245px)", transform: "rotate(2deg)" },
    heartPos: { bottom: "5%", right: "5%" },
    delay: 0.11,
  },
  {
    src: "/assets/watches/patek_nautilus-removebg-preview.png",
    alt: "Patek Nautilus",
    brand: "Patek Philippe",
    style: { top: "5%", right: "5%", width: "clamp(190px, 17vw, 250px)", transform: "rotate(-3deg)" },
    heartPos: { bottom: "5%", left: "5%" },
    delay: 0.2,
  },
  {
    src: "/assets/watches/panda_daytona-removebg-preview.png",
    alt: "Rolex Panda Daytona",
    brand: "Rolex",
    nameHint: "Daytona",
    style: { bottom: "-5%", right: "16%", width: "clamp(190px, 17vw, 250px)", transform: "rotate(-2deg)" },
    heartPos: { top: "5%", right: "5%" },
    delay: 0.25,
  },
];

const SHADOW = { filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.10))" };

function HeroWatchHeart({ watch, products }) {
  const [isFav, setIsFav] = useState(false);

  // Find matching product by brand (and optional name hint)
  const product = products.find(p => {
    if (p.brand !== watch.brand) return false;
    if (watch.nameHint) return p.name.toLowerCase().includes(watch.nameHint.toLowerCase());
    return true;
  });

  useEffect(() => {
    if (product) setIsFav(window.__isFavorite?.(product.id) || false);
  });

  if (!product) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    const images = product.images ? (typeof product.images === 'string' ? JSON.parse(product.images) : product.images) : [];
    window.__toggleFavorite?.(product.id, {
      name: product.name,
      brand: product.brand,
      price: product.price,
      original_price: product.original_price,
      image_url: images[0] || watch.src,
      category: product.category,
    });
  };

  return (
    <button
      onClick={handleClick}
      className="absolute z-20 w-8 h-8 bg-white/90 backdrop-blur-sm border border-warm-border rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all duration-200 shadow-sm"
      style={watch.heartPos}
    >
      <Heart className={`w-3.5 h-3.5 ${isFav ? "fill-accent-orange text-accent-orange" : "text-muted-warm"}`} />
    </button>
  );
}

export default function HeroBanner() {
  const { data: products = [] } = useQuery({
    queryKey: ["watches-all"],
    queryFn: () => api.watches.list(),
    staleTime: 5 * 60 * 1000,
  });

  return (
    <section className="relative bg-cream overflow-hidden" style={{ minHeight: "100vh" }}>

      {/* ── DESKTOP ── */}

      {/* Watch layer */}
      <div
        className="hidden md:block absolute left-0 right-0 bottom-0"
        style={{ top: "4rem" }}
      >
        {WATCHES.map((w, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: w.delay, duration: 0.75, ease: "easeOut" }}
            className="absolute group/hero"
            style={w.style}
          >
            <img
              src={w.src}
              alt={w.alt}
              className="w-full object-contain select-none"
              style={SHADOW}
            />
            <div className="opacity-0 group-hover/hero:opacity-100 transition-opacity duration-200">
              <HeroWatchHeart watch={w} products={products} />
            </div>
          </motion.div>
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

          <p className="mt-5 text-sm font-light tracking-wide text-muted-warm leading-relaxed" style={{ maxWidth: "420px" }}>
            Experience premium replica timepieces crafted with remarkable attention to detail and up to 90% accuracy. Standing out from other replica brands with almost 1:1 exterior detailing, mirroring even the smallest details.
          </p>

          <Link
            to={createPageUrl("reviews")}
            className="mt-6 inline-flex items-center gap-2 bg-warm-black text-white px-6 py-3 rounded-lg text-xs tracking-[0.15em] uppercase font-medium hover:bg-warm-black/90 transition-colors"
          >
            Read Our Reviews
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
          <Link
            to={createPageUrl("reviews")}
            className="mt-5 inline-flex items-center gap-2 bg-warm-black text-white px-6 py-3 rounded-lg text-xs tracking-[0.15em] uppercase font-medium hover:bg-warm-black/90 transition-colors"
          >
            Read Our Reviews
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
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
