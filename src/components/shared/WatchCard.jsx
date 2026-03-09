import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { motion } from "framer-motion";
import { ShoppingBag, Heart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function WatchCard({ watch, index = 0, onAddToCart }) {
  const discount = watch.original_price
    ? Math.round(((watch.original_price - watch.price) / watch.original_price) * 100)
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group relative"
    >
      <Link to={createPageUrl("ProductDetail") + `?id=${watch.id}`}>
        <div className="relative aspect-square overflow-hidden bg-card border border-border/50 rounded-sm">
          <img
            src={watch.image_url || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600&q=80"}
            alt={watch.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-500" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            {watch.category === "new_arrival" && (
              <Badge className="bg-gold text-primary-foreground text-[10px] tracking-[0.15em] uppercase rounded-none px-3 py-1 font-medium hover:bg-gold-light">
                New
              </Badge>
            )}
            {watch.category === "sale" && discount > 0 && (
              <Badge className="bg-red-600 text-white text-[10px] tracking-[0.15em] uppercase rounded-none px-3 py-1 font-medium hover:bg-red-600">
                -{discount}%
              </Badge>
            )}
            {watch.category === "limited_edition" && (
              <Badge className="bg-white text-black text-[10px] tracking-[0.15em] uppercase rounded-none px-3 py-1 font-medium hover:bg-white/90">
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
              className="w-10 h-10 bg-white flex items-center justify-center hover:bg-gold transition-colors duration-200"
            >
              <ShoppingBag className="w-4 h-4 text-black" />
            </button>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className="w-10 h-10 bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-white/20 transition-colors duration-200"
            >
              <Heart className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </Link>

      {/* Info */}
      <div className="mt-4 space-y-1">
        <p className="text-[10px] text-gold tracking-[0.2em] uppercase">{watch.brand}</p>
        <Link to={createPageUrl("ProductDetail") + `?id=${watch.id}`}>
          <h3 className="text-foreground text-sm font-light tracking-wide hover:text-gold transition-colors">
            {watch.name}
          </h3>
        </Link>
        <div className="flex items-center gap-3 pt-1">
          <span className="text-foreground font-light text-sm">
            ${watch.price?.toLocaleString()}
          </span>
          {watch.original_price && watch.original_price > watch.price && (
            <span className="text-muted-foreground line-through text-xs">
              ${watch.original_price?.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
