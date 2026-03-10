import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function CartDrawer({ isOpen, onClose, cart, setCart }) {
  const updateQuantity = (index, delta) => {
    setCart((prev) => {
      const updated = [...prev];
      updated[index].quantity += delta;
      if (updated[index].quantity <= 0) {
        updated.splice(index, 1);
      }
      return updated;
    });
  };

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-card z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-gold" />
                <h2 className="text-foreground text-lg font-light tracking-wide">Your Cart</h2>
                <span className="text-muted-foreground text-sm">({cart.length})</span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-white/10 mb-4" />
                  <p className="text-muted-foreground text-sm">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-gold text-xs tracking-[0.15em] uppercase hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-20 h-20 bg-[#1A1A1A] rounded-sm overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&q=80"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-gold tracking-[0.2em] uppercase">{item.brand}</p>
                      <p className="text-foreground text-sm font-light truncate">{item.name}</p>
                      <p className="text-muted-foreground text-sm mt-1">${item.price?.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="w-7 h-7 border border-white/10 flex items-center justify-center text-white/50 hover:border-white/30 transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-foreground text-xs w-4 text-center">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="w-7 h-7 border border-white/10 flex items-center justify-center text-white/50 hover:border-white/30 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(index)}
                          className="text-muted-foreground hover:text-red-400 transition-colors"
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
            {cart.length > 0 && (
              <div className="p-6 border-t border-white/10 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">Subtotal</span>
                  <span className="text-foreground text-lg font-light">${total.toLocaleString()}</span>
                </div>
                <Link
                  to={createPageUrl("checkout")}
                  onClick={onClose}
                  className="block w-full bg-gold text-primary-foreground text-center py-4 text-xs tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={onClose}
                  className="block w-full text-center text-muted-foreground text-xs tracking-[0.1em] uppercase hover:text-foreground transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
