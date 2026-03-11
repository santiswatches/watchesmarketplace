import React, { useState, useEffect } from "react";
import { base44 } from "@/services/api";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, ShieldCheck, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function Checkout() {
  const [cart, setCart] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [returnGuarantee, setReturnGuarantee] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (!isAuthenticated) {
        base44.auth.redirectToLogin(createPageUrl("checkout"));
        return;
      }

      try {
        const user = await base44.auth.me();
        setFormData(prev => ({
          ...prev,
          name: user.full_name || prev.name,
          email: user.email || prev.email,
        }));
      } catch (error) {
        console.error("Error loading user:", error);
      }

      setIsLoadingAuth(false);
    };

    checkAuth();

    const saved = localStorage.getItem("watch_cart");
    if (saved) setCart(JSON.parse(saved));
  }, []);

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const returnGuaranteeFee = returnGuarantee ? 20 : 0;
  const grandTotal = subtotal + returnGuaranteeFee;

  // Load PayPal SDK
  useEffect(() => {
    if (document.getElementById("paypal-sdk")) {
      setPaypalLoaded(true);
      return;
    }
    const script = document.createElement("script");
    script.id = "paypal-sdk";
    script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD";
    script.onload = () => setPaypalLoaded(true);
    document.body.appendChild(script);
  }, []);

  // Render PayPal buttons
  useEffect(() => {
    if (!paypalLoaded || !window.paypal || cart.length === 0 || orderComplete) return;
    const container = document.getElementById("paypal-button-container");
    if (!container) return;
    container.innerHTML = "";

    window.paypal
      .Buttons({
        style: {
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
          height: 50,
        },
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: grandTotal.toFixed(2),
                },
                description: `Santi's Watches Order - ${cart.length} item(s)`,
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          setIsProcessing(true);
          const details = await actions.order.capture();

          // Create order in database
          await base44.entities.Order.create({
            customer_email: formData.email || details.payer?.email_address || "",
            customer_name: formData.name || details.payer?.name?.given_name || "",
            items: cart.map((item) => ({
              watch_id: item.watch_id,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
              image_url: item.image_url,
            })),
            total_amount: grandTotal,
            return_guarantee: returnGuarantee,
            status: "paid",
            paypal_order_id: details.id,
            shipping_address: formData.address,
          });

          // Clear cart
          localStorage.removeItem("watch_cart");
          window.__setWatchCart?.([]);
          setOrderComplete(true);
          setIsProcessing(false);
        },
        onError: (err) => {
          console.error("PayPal error:", err);
          setIsProcessing(false);
        },
      })
      .render("#paypal-button-container");
  }, [paypalLoaded, cart, grandTotal, formData, orderComplete]);

  if (orderComplete) {
    return (
      <div className="bg-offwhite min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-accent-orange/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-accent-orange" />
          </div>
          <h1 className="text-3xl text-warm-black font-light mb-3">Order Confirmed</h1>
          <p className="text-muted-warm text-sm font-light mb-8">
            Thank you for your purchase. You'll receive a confirmation email shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to={createPageUrl("my-orders")}
              className="bg-warm-black text-white py-3 text-xs tracking-[0.15em] uppercase font-medium hover:bg-warm-black/90 transition-colors text-center rounded-lg"
            >
              View My Orders
            </Link>
            <Link
              to={createPageUrl("home")}
              className="text-muted-warm text-xs tracking-[0.1em] uppercase hover:text-warm-black transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isLoadingAuth) {
    return (
      <div className="bg-offwhite min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-muted-warm">Loading...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-offwhite min-h-screen pt-24 flex flex-col items-center justify-center">
        <p className="text-muted-warm text-lg font-light mb-4">Your cart is empty</p>
        <Link to={createPageUrl("shop")} className="text-accent-orange text-sm hover:underline">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-offwhite min-h-screen pt-20 md:pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <Link
          to={createPageUrl("shop")}
          className="inline-flex items-center gap-2 text-muted-warm hover:text-warm-black text-xs tracking-wide mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-3xl text-warm-black font-light tracking-tight mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-warm-black text-sm tracking-[0.15em] uppercase mb-6 font-medium">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-muted-warm text-xs">Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 border-warm-border text-warm-black placeholder:text-muted-warm"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label className="text-muted-warm text-xs">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 border-warm-border text-warm-black placeholder:text-muted-warm"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label className="text-muted-warm text-xs">Shipping Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 border-warm-border text-warm-black placeholder:text-muted-warm h-24"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div>
              <h2 className="text-warm-black text-sm tracking-[0.15em] uppercase mb-6 flex items-center gap-2 font-medium">
                <Lock className="w-4 h-4 text-amber-gold" />
                Secure Payment
              </h2>
              {isProcessing ? (
                <div className="text-center py-10">
                  <div className="animate-pulse text-muted-warm">Processing payment...</div>
                </div>
              ) : (
                <div id="paypal-button-container" className="min-h-[60px]" />
              )}
              {!paypalLoaded && (
                <div className="text-center py-6">
                  <div className="animate-pulse text-muted-warm text-sm">Loading payment options...</div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl p-6 sticky top-28 border border-warm-border">
              <h2 className="text-warm-black text-sm tracking-[0.15em] uppercase mb-6 font-medium">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-14 h-14 bg-offwhite rounded-lg overflow-hidden flex-shrink-0 border border-warm-border">
                      <img
                        src={item.image_url || "/assets/watches/panda_daytona-removebg-preview.png"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-warm-black text-xs truncate font-medium">{item.name}</p>
                      <p className="text-muted-warm text-[10px]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-warm-black text-xs font-medium">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              {/* Return Guarantee Add-on */}
              <button
                type="button"
                onClick={() => setReturnGuarantee(prev => !prev)}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left mb-2 ${
                  returnGuarantee
                    ? "border-accent-orange bg-accent-orange/5"
                    : "border-warm-border hover:bg-offwhite"
                }`}
              >
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  returnGuarantee
                    ? "border-accent-orange bg-accent-orange"
                    : "border-warm-border"
                }`}>
                  {returnGuarantee && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-warm-black text-xs font-medium">Return Guarantee</p>
                  <p className="text-muted-warm text-[10px] leading-relaxed">
                    Add for $20 — guarantees the option to return for a full refund
                  </p>
                </div>
                <span className="text-accent-orange text-xs font-semibold flex-shrink-0">$20</span>
              </button>

              <div className="border-t border-warm-border pt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-warm">Subtotal</span>
                  <span className="text-warm-black">${subtotal.toLocaleString()}</span>
                </div>
                {returnGuarantee && (
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-warm">Return Guarantee</span>
                    <span className="text-warm-black">$20</span>
                  </div>
                )}
                <div className="flex justify-between text-sm pt-3 border-t border-warm-border">
                  <span className="text-warm-black font-medium">Total</span>
                  <span className="text-accent-orange text-lg font-semibold">${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
