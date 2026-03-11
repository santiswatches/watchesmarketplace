import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { X, Heart, Trash2, ShoppingBag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function FavoritesDrawer({ isOpen, onClose, favorites, onRemove, onAddToCart }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="favorites-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-warm-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            key="favorites-drawer"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[51] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-warm-border">
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-warm-black" />
                <h2 className="text-warm-black text-base font-semibold tracking-wide uppercase">
                  Favorites
                </h2>
                <span className="text-muted-warm text-sm">({favorites.length})</span>
              </div>
              <button
                onClick={onClose}
                className="text-muted-warm hover:text-warm-black transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {favorites.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Heart className="w-12 h-12 text-warm-border mb-4" />
                  <p className="text-muted-warm text-sm">No favorites yet</p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-accent-orange text-[11px] font-semibold tracking-widest uppercase hover:underline"
                  >
                    Browse Watches
                  </button>
                </div>
              ) : (
                favorites.map((item) => (
                  <div key={item.product_id} className="flex gap-4">
                    <Link
                      to={createPageUrl("product-detail") + `?id=${item.product_id}`}
                      onClick={onClose}
                      className="w-20 h-20 bg-offwhite border border-warm-border rounded-lg overflow-hidden flex-shrink-0"
                    >
                      <img
                        src={item.image_url || "/assets/watches/panda_daytona-removebg-preview.png"}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-accent-orange font-semibold tracking-widest uppercase">
                        {item.brand}
                      </p>
                      <Link
                        to={createPageUrl("product-detail") + `?id=${item.product_id}`}
                        onClick={onClose}
                      >
                        <p className="text-warm-black text-sm font-medium truncate hover:text-accent-orange transition-colors">
                          {item.name}
                        </p>
                      </Link>
                      <p className="text-muted-warm text-sm mt-0.5">${item.price?.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <button
                          onClick={() => onAddToCart?.(item)}
                          className="flex items-center gap-1.5 text-[10px] font-semibold tracking-widest uppercase text-warm-black hover:text-accent-orange transition-colors"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" />
                          Add to Cart
                        </button>
                        <button
                          onClick={() => onRemove(item.product_id)}
                          className="text-muted-warm hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {favorites.length > 0 && (
              <div className="p-6 border-t border-warm-border space-y-3">
                <Link
                  to={createPageUrl("shop")}
                  onClick={onClose}
                  className="block w-full bg-warm-black text-white text-center py-4 text-[11px] font-semibold tracking-widest uppercase hover:opacity-90 transition-opacity rounded-lg"
                >
                  Browse More Watches
                </Link>
                <button
                  onClick={onClose}
                  className="block w-full text-center text-muted-warm text-[11px] font-semibold tracking-widest uppercase hover:text-warm-black transition-colors"
                >
                  Close
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
