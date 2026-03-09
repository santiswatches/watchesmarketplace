import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, ChevronLeft, Shield, Truck, RotateCcw, Minus, Plus, ChevronDown } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";

export default function ProductDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const watchId = urlParams.get("id");
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { data: watch, isLoading } = useQuery({
    queryKey: ["watch", watchId],
    queryFn: async () => {
      const watches = await base44.entities.Watch.list();
      return watches.find((w) => w.id === watchId);
    },
    enabled: !!watchId,
  });

  const addToCart = async () => {
    if (!watch) return;

    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    const cart = window.__watchCart || [];
    const existingIndex = cart.findIndex((item) => item.watch_id === watch.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += quantity;
      window.__setWatchCart?.(updated);
    } else {
      window.__setWatchCart?.([
        ...cart,
        {
          watch_id: watch.id,
          name: watch.name + (activeVariant ? ` - ${activeVariant.name}` : ''),
          brand: watch.brand,
          price: currentPrice,
          image_url: images[0],
          quantity
        },
      ]);
    }
    window.__openCart?.();
  };

  if (isLoading) {
    return (
      <div className="bg-background min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!watch) {
    return (
      <div className="bg-background min-h-screen pt-24 flex flex-col items-center justify-center text-center">
        <p className="text-muted-foreground text-lg mb-4">Watch not found</p>
        <Link to={createPageUrl("Shop")} className="text-gold text-sm hover:underline">
          Back to Shop
        </Link>
      </div>
    );
  }

  const activeVariant = selectedVariant || null;
  const hasVariants = watch.variants && watch.variants.length > 0;

  const currentPrice = activeVariant?.price ?? watch.price;
  const currentOriginalPrice = activeVariant?.original_price ?? watch.original_price;
  const currentDescription = activeVariant?.description ?? watch.description;
  const currentCaseMaterial = activeVariant?.case_material ?? watch.case_material;

  const variantImages = activeVariant?.gallery_urls || [];
  const baseImages = [watch.image_url, ...(watch.gallery_urls || [])].filter(Boolean);
  const images = variantImages.length > 0 ? variantImages : baseImages;
  if (images.length === 0) images.push("https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80");

  const discount = currentOriginalPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  return (
    <div className="bg-background min-h-screen pt-20 md:pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Breadcrumb */}
        <Link
          to={createPageUrl("Shop")}
          className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs tracking-wide mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Collection
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Images */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="aspect-square bg-card rounded-sm overflow-hidden mb-4 border border-border/50">
              <img
                src={images[selectedImage]}
                alt={watch.name}
                className="w-full h-full object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(i)}
                    className={`w-20 h-20 rounded-sm overflow-hidden border-2 transition-colors ${selectedImage === i ? "border-gold" : "border-transparent opacity-50 hover:opacity-80"
                      }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Details */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col">
            <p className="text-gold tracking-[0.3em] uppercase text-xs mb-2">{watch.brand}</p>
            <h1 className="text-3xl md:text-4xl text-foreground font-light tracking-tight mb-4">{watch.name}</h1>

            {watch.short_description && (
              <p className="text-muted-foreground text-sm font-light mb-6">{watch.short_description}</p>
            )}

            {/* Variant Selector */}
            {hasVariants && (
              <div className="mb-6">
                <Label className="text-white/60 text-xs tracking-[0.2em] uppercase mb-3 block">Select Option</Label>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedVariant(null);
                      setSelectedImage(0);
                    }}
                    className={`px-4 py-2 text-sm transition-all ${!selectedVariant
                        ? "bg-gold text-primary-foreground border-2 border-gold"
                        : "bg-white/5 text-foreground border-2 border-white/10 hover:border-white/30"
                      }`}
                  >
                    A grade clone
                  </button>
                  {watch.variants.map((variant, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => {
                        setSelectedVariant(variant);
                        setSelectedImage(0);
                      }}
                      className={`px-4 py-2 text-sm transition-all ${selectedVariant?.name === variant.name
                          ? "bg-gold text-primary-foreground border-2 border-gold"
                          : "bg-white/5 text-foreground border-2 border-white/10 hover:border-white/30"
                        }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-foreground text-2xl font-light">${currentPrice?.toLocaleString()}</span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <>
                  <span className="text-muted-foreground line-through text-lg">${currentOriginalPrice?.toLocaleString()}</span>
                  <Badge className="bg-red-600 text-white text-[10px] rounded-none px-2 py-0.5 hover:bg-red-600">
                    -{discount}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Specs */}
            <div className="grid grid-cols-2 gap-4 mb-8 py-6 border-y border-white/5">
              {watch.movement && (
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Movement</p>
                  <p className="text-white text-sm mt-1">{watch.movement}</p>
                </div>
              )}
              {currentCaseMaterial && (
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Case Material</p>
                  <p className="text-white text-sm mt-1">{currentCaseMaterial}</p>
                </div>
              )}
              {watch.case_diameter && (
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Case Size</p>
                  <p className="text-white text-sm mt-1">{watch.case_diameter}</p>
                </div>
              )}
              {watch.water_resistance && (
                <div>
                  <p className="text-white/30 text-[10px] tracking-[0.2em] uppercase">Water Resistance</p>
                  <p className="text-white text-sm mt-1">{watch.water_resistance}</p>
                </div>
              )}
            </div>

            {/* Quantity & Add to Cart */}
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center border border-white/10">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-10 h-10 flex items-center justify-center text-white text-sm border-x border-white/10">
                  {quantity}
                </span>
                <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-white/50 hover:text-white transition-colors">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={addToCart}
                className="flex-1 bg-gold text-primary-foreground py-3.5 text-xs tracking-[0.15em] uppercase font-medium hover:bg-gold-light transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
              <button className="w-12 h-12 border border-white/10 flex items-center justify-center text-white/40 hover:text-gold hover:border-gold/40 transition-all">
                <Heart className="w-4 h-4" />
              </button>
            </div>

            {/* Description */}
            {currentDescription && (
              <div className="mb-8">
                <p className="text-white/50 text-sm font-light leading-relaxed">{currentDescription}</p>
              </div>
            )}

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-4 mt-auto pt-6 border-t border-white/5">
              <div className="text-center">
                <Shield className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="text-white/40 text-[10px] tracking-wider uppercase">Authenticated</p>
              </div>
              <div className="text-center">
                <Truck className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="text-white/40 text-[10px] tracking-wider uppercase">Free Shipping</p>
              </div>
              <div className="text-center">
                <RotateCcw className="w-5 h-5 text-gold mx-auto mb-2" />
                <p className="text-white/40 text-[10px] tracking-wider uppercase">30-Day Returns</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
