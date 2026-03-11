import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
            className="fixed inset-0 bg-warm-black/40 backdrop-blur-sm z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-warm-border">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-warm-black" />
                <h2 className="text-warm-black text-base font-semibold tracking-wide uppercase">
                  Your Cart
                </h2>
                <span className="text-muted-warm text-sm">({cart.length})</span>
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
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="w-12 h-12 text-warm-border mb-4" />
                  <p className="text-muted-warm text-sm">Your cart is empty</p>
                  <button
                    onClick={onClose}
                    className="mt-4 text-accent-orange text-[11px] font-semibold tracking-widest uppercase hover:underline"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                cart.map((item, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-20 h-20 bg-offwhite border border-warm-border rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || "/assets/watches/panda_daytona-removebg-preview.png"}
                        alt={item.name}
                        className="w-full h-full object-contain p-1"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-accent-orange font-semibold tracking-widest uppercase">
                        {item.brand}
                      </p>
                      <p className="text-warm-black text-sm font-medium truncate">{item.name}</p>
                      <p className="text-muted-warm text-sm mt-0.5">${item.price?.toLocaleString()}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(index, -1)}
                            className="w-7 h-7 border border-warm-border rounded flex items-center justify-center text-muted-warm hover:border-warm-black hover:text-warm-black transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-warm-black text-xs w-4 text-center font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(index, 1)}
                            className="w-7 h-7 border border-warm-border rounded flex items-center justify-center text-muted-warm hover:border-warm-black hover:text-warm-black transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(index)}
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
            {cart.length > 0 && (
              <div className="p-6 border-t border-warm-border space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-warm text-sm">Subtotal</span>
                  <span className="text-warm-black text-lg font-semibold">
                    ${total.toLocaleString()}
                  </span>
                </div>
                <Link
                  to={createPageUrl("checkout")}
                  onClick={onClose}
                  className="block w-full bg-warm-black text-white text-center py-4 text-[11px] font-semibold tracking-widest uppercase hover:opacity-90 transition-opacity rounded-lg"
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={onClose}
                  className="block w-full text-center text-muted-warm text-[11px] font-semibold tracking-widest uppercase hover:text-warm-black transition-colors"
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
