import React, { useState, useEffect } from "react";
import { base44 } from "@/services/api";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { ChevronLeft, Lock, ShieldCheck } from "lucide-react";
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

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = total > 5000 ? 0 : 75;
  const grandTotal = total + shipping;

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
      <div className="bg-[#0A0A0A] min-h-screen pt-24 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md mx-auto px-6"
        >
          <div className="w-20 h-20 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-gold" />
          </div>
          <h1 className="text-3xl text-foreground font-light mb-3">Order Confirmed</h1>
          <p className="text-muted-foreground text-sm font-light mb-8">
            Thank you for your purchase. You'll receive a confirmation email shortly.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              to={createPageUrl("my-orders")}
              className="bg-gold text-primary-foreground py-3 text-xs tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors text-center"
            >
              View My Orders
            </Link>
            <Link
              to={createPageUrl("home")}
              className="text-muted-foreground text-xs tracking-[0.1em] uppercase hover:text-foreground transition-colors"
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
      <div className="bg-background min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="bg-background min-h-screen pt-24 flex flex-col items-center justify-center">
        <p className="text-muted-foreground text-lg font-light mb-4">Your cart is empty</p>
        <Link to={createPageUrl("shop")} className="text-gold text-sm hover:underline">
          Browse Collection
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-20 md:pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-6 lg:px-12">
        <Link
          to={createPageUrl("shop")}
          className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs tracking-wide mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Continue Shopping
        </Link>

        <h1 className="text-3xl text-foreground font-light tracking-tight mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Form */}
          <div className="lg:col-span-3 space-y-8">
            <div>
              <h2 className="text-white text-sm tracking-[0.15em] uppercase mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div>
                  <Label className="text-white/50 text-xs">Full Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#C9A962]/30"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label className="text-white/50 text-xs">Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#C9A962]/30"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <Label className="text-white/50 text-xs">Shipping Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/20 focus-visible:ring-[#C9A962]/30 h-24"
                    placeholder="123 Main St, City, State, ZIP"
                  />
                </div>
              </div>
            </div>

            {/* PayPal */}
            <div>
              <h2 className="text-foreground text-sm tracking-[0.15em] uppercase mb-6 flex items-center gap-2">
                <Lock className="w-4 h-4 text-gold" />
                Secure Payment
              </h2>
              {isProcessing ? (
                <div className="text-center py-10">
                  <div className="animate-pulse text-white/40">Processing payment...</div>
                </div>
              ) : (
                <div id="paypal-button-container" className="min-h-[60px]" />
              )}
              {!paypalLoaded && (
                <div className="text-center py-6">
                  <div className="animate-pulse text-white/30 text-sm">Loading payment options...</div>
                </div>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-sm p-6 sticky top-28 border border-border/50">
              <h2 className="text-white text-sm tracking-[0.15em] uppercase mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                {cart.map((item, i) => (
                  <div key={i} className="flex gap-3">
                    <div className="w-14 h-14 bg-[#1A1A1A] rounded-sm overflow-hidden flex-shrink-0">
                      <img
                        src={item.image_url || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&q=80"}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs truncate">{item.name}</p>
                      <p className="text-white/30 text-[10px]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-white text-xs">${(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Subtotal</span>
                  <span className="text-white">${total.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-white/40">Shipping</span>
                  <span className="text-white">{shipping === 0 ? "Free" : `$${shipping}`}</span>
                </div>
                <div className="flex justify-between text-sm pt-3 border-t border-white/5">
                  <span className="text-foreground">Total</span>
                  <span className="text-gold text-lg font-light">${grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
