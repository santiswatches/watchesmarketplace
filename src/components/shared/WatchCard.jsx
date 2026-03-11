import React, { useState, useRef, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { ShoppingBag, Heart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getVideoMimeType } from "../../utils/media";

export default function WatchCard({ watch, index = 0, onAddToCart }) {
  const discount = watch.original_price
    ? Math.round(((watch.original_price - watch.price) / watch.original_price) * 100)
    : 0;

  const hasVideo = watch.videos?.length > 0;
  const [isHovered, setIsHovered] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const sync = () => setIsFav(window.__isFavorite?.(watch.id) || false);
    sync();
    window.addEventListener('favorites-changed', sync);
    return () => window.removeEventListener('favorites-changed', sync);
  }, [watch.id]);

  const handleToggleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFav(prev => !prev);
    const images = watch.images ? (typeof watch.images === 'string' ? JSON.parse(watch.images) : watch.images) : [];
    window.__toggleFavorite?.(watch.id, {
      name: watch.name,
      brand: watch.brand,
      price: watch.price,
      original_price: watch.original_price,
      image_url: watch.image_url || images[0] || null,
      category: watch.category,
    });
  };

  const handleMouseEnter = useCallback(() => {
    if (!hasVideo) return;
    setIsHovered(true);
    const video = videoRef.current;
    if (video) {
      video.play().catch(() => {});
    }
  }, [hasVideo]);

  const handleMouseLeave = useCallback(() => {
    if (!hasVideo) return;
    setIsHovered(false);
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, [hasVideo]);

  return (
    <div
      className="group relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <Link to={createPageUrl("product-detail") + `?id=${watch.id}`}>
        <div className="relative aspect-square overflow-hidden bg-offwhite border border-warm-border rounded-xl hover:shadow-md transition-shadow duration-300 flex items-center justify-center p-4">
          <img
            src={watch.image_url || "/assets/watches/panda_daytona-removebg-preview.png"}
            alt={watch.name}
            loading="lazy"
            className={`w-full h-full object-contain transition-all duration-500 ease-out ${
              isHovered && hasVideo ? "opacity-0" : "opacity-100 group-hover:scale-105"
            }`}
          />
          {hasVideo && (
            <video
              ref={videoRef}
              muted
              loop
              playsInline
              preload="none"
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${
                isHovered ? "opacity-100" : "opacity-0"
              }`}
            >
              <source src={watch.videos[0]} type={getVideoMimeType(watch.videos[0])} />
            </video>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {watch.category === "new_arrival" && (
              <Badge className="bg-accent-orange text-white text-[9px] tracking-widest uppercase rounded-sm px-2.5 py-1 font-semibold hover:bg-accent-orange">
                New
              </Badge>
            )}
            {watch.category === "sale" && discount > 0 && (
              <Badge className="bg-accent-orange text-white text-[9px] tracking-widest uppercase rounded-sm px-2.5 py-1 font-semibold hover:bg-accent-orange">
                -{discount}%
              </Badge>
            )}
            {watch.category === "limited_edition" && (
              <Badge className="bg-warm-black text-white text-[9px] tracking-widest uppercase rounded-sm px-2.5 py-1 font-semibold hover:bg-warm-black">
                Limited
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          <div className="absolute bottom-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onAddToCart?.(watch);
              }}
              className="w-9 h-9 bg-white border border-warm-border rounded-lg flex items-center justify-center hover:bg-warm-black hover:border-warm-black hover:text-white transition-colors duration-200"
            >
              <ShoppingBag className="w-4 h-4" />
            </button>
            <motion.button
              onClick={handleToggleFavorite}
              whileTap={{ scale: 0.8 }}
              className={`w-9 h-9 bg-white border border-warm-border rounded-lg flex items-center justify-center hover:bg-offwhite transition-colors duration-200 ${isFav ? "border-accent-orange" : ""}`}
            >
              <motion.span
                key={isFav ? "saved" : "unsaved"}
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                className="flex"
              >
                <Heart className={`w-4 h-4 ${isFav ? "fill-accent-orange text-accent-orange" : "text-muted-warm"}`} />
              </motion.span>
            </motion.button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-3 space-y-0.5">
        <p className="font-sans text-[11px] font-semibold tracking-widest uppercase text-accent-orange">
          {watch.brand}
        </p>
        <Link to={createPageUrl("product-detail") + `?id=${watch.id}`}>
          <h3 className="font-sans text-sm font-medium text-warm-black hover:text-accent-orange transition-colors">
            {watch.name}
          </h3>
        </Link>
        <div className="flex items-center gap-3 pt-0.5">
          <span className="font-sans font-semibold text-sm text-warm-black">
            ${watch.price?.toLocaleString()}
          </span>
          {watch.original_price && watch.original_price > watch.price && (
            <span className="font-sans text-muted-warm line-through text-xs">
              ${watch.original_price?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}