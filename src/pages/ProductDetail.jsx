import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { ShoppingBag, Heart, ChevronLeft, Shield, Truck, RotateCcw, Minus, Plus, Play, Star } from "lucide-react";
import { fetchProductReviews } from "@/services/reviews";
import { Label } from "@/components/ui/label";
import WatchCard from "../components/shared/WatchCard";
import VideoPlayer from "../components/shared/VideoPlayer";
import { buildMediaItems, isVideoUrl } from "../utils/media";

export default function ProductDetail() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const watchId = urlParams.get("id");
  const [quantity, setQuantity] = useState(1);
  const [selectedMedia, setSelectedMedia] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const { data: watch, isLoading } = useQuery({
    queryKey: ["watch", watchId],
    queryFn: async () => {
      const watches = await base44.entities.Watch.list();
      return watches.find((w) => w.id === watchId);
    },
    enabled: !!watchId,
  });

  const { data: allWatches } = useQuery({
    queryKey: ["watches-related"],
    queryFn: () => base44.entities.Watch.list(),
    enabled: !!watch,
  });

  const { data: productReviews = [] } = useQuery({
    queryKey: ["product-reviews", watchId],
    queryFn: () => fetchProductReviews(watchId),
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
          name: watch.name + (activeVariant ? ` - ${activeVariant.name}` : ""),
          brand: watch.brand,
          price: currentPrice,
          image_url: images[0],
          quantity,
        },
      ]);
    }
    window.__openCart?.();
  };

  if (isLoading) {
    return (
      <div className="bg-cream min-h-screen pt-24 flex items-center justify-center">
        <div className="animate-pulse text-muted-warm tracking-widest text-xs uppercase">Loading...</div>
      </div>
    );
  }

  if (!watch) {
    return (
      <div className="bg-offwhite min-h-screen pt-24 flex flex-col items-center justify-center text-center">
        <p className="text-muted-warm text-lg mb-4">Watch not found</p>
        <Link to={createPageUrl("shop")} className="text-accent-orange text-sm hover:underline">
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
  const videos = watch.videos || [];
  const mediaItems = buildMediaItems(images, videos);

  const discount = currentOriginalPrice
    ? Math.round(((currentOriginalPrice - currentPrice) / currentOriginalPrice) * 100)
    : 0;

  const specs = [
    watch.movement && { label: "Movement", value: watch.movement },
    currentCaseMaterial && { label: "Case Material", value: currentCaseMaterial },
    watch.case_diameter && { label: "Case Size", value: watch.case_diameter },
    watch.water_resistance && { label: "Water Resistance", value: watch.water_resistance },
  ].filter(Boolean);

  const relatedWatches = allWatches
    ? allWatches.filter((w) => w.id !== watch.id && w.brand === watch.brand).slice(0, 4)
    : [];
  const fallbackWatches = allWatches
    ? allWatches.filter((w) => w.id !== watch.id).slice(0, 4)
    : [];
  const displayRelated = relatedWatches.length >= 2 ? relatedWatches : fallbackWatches;

  return (
    <div className="bg-cream min-h-screen">
      {/* Breadcrumb bar */}
      <div className="border-b border-warm-border bg-cream pt-20 md:pt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-4">
          <Link
            to={createPageUrl("shop")}
            className="inline-flex items-center gap-1.5 text-muted-warm hover:text-warm-black text-[11px] tracking-[0.2em] uppercase transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Back to Collection
          </Link>
        </div>
      </div>

      {/* Main product section */}
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 lg:gap-16 xl:gap-24 py-10 lg:py-16">

          {/* Left — Media gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex gap-4"
          >
            {/* Vertical thumbnail strip */}
            {mediaItems.length > 1 && (
              <div className="flex flex-col gap-3 w-16 shrink-0">
                {mediaItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedMedia(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                      selectedMedia === i
                        ? "border-amber-gold opacity-100"
                        : "border-warm-border opacity-50 hover:opacity-80"
                    }`}
                  >
                    {item.type === 'video' ? (
                      <>
                        <video src={item.url} muted playsInline preload="metadata" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <Play className="w-4 h-4 text-white" fill="white" />
                        </div>
                      </>
                    ) : (
                      <img src={item.url} alt="" className="w-full h-full object-cover mix-blend-multiply" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Main media */}
            <div className="flex-1 aspect-[3/4] overflow-hidden rounded-xl bg-cream">
              {mediaItems[selectedMedia]?.type === 'video' ? (
                <VideoPlayer
                  src={mediaItems[selectedMedia].url}
                  controls
                  autoPlay={false}
                  muted={false}
                  loop={false}
                  className="w-full h-full"
                />
              ) : (
                <img
                  src={mediaItems[selectedMedia]?.url}
                  alt={watch.name}
                  className="w-full h-full object-cover mix-blend-multiply"
                />
              )}
            </div>
          </motion.div>

          {/* Right — Details panel (sticky) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:sticky lg:top-24 lg:self-start bg-offwhite rounded-2xl p-8 lg:p-10"
          >
            {/* Brand + Name */}
            <p className="text-accent-orange tracking-[0.35em] uppercase text-[11px] font-semibold mb-3">
              {watch.brand}
            </p>
            <h1 className="text-4xl md:text-5xl text-warm-black font-extralight tracking-tight leading-tight mb-6">
              {watch.name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-4 border-l-2 border-amber-gold pl-4 mb-8">
              <span className="text-warm-black text-3xl font-light">${currentPrice?.toLocaleString()}</span>
              {currentOriginalPrice && currentOriginalPrice > currentPrice && (
                <>
                  <span className="text-muted-warm line-through text-lg font-light">
                    ${currentOriginalPrice?.toLocaleString()}
                  </span>
                  <span className="text-[11px] tracking-[0.15em] uppercase border border-accent-orange text-accent-orange px-2 py-0.5">
                    -{discount}% off
                  </span>
                </>
              )}
            </div>

            {/* Variant Selector */}
            {hasVariants && (
              <div className="mb-8">
                <Label className="text-muted-warm text-[10px] tracking-[0.25em] uppercase mb-3 block">
                  Select Option
                </Label>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setSelectedVariant(null); setSelectedMedia(0); }}
                    className={`px-4 py-2 text-xs tracking-wider uppercase transition-all border ${
                      !selectedVariant
                        ? "bg-warm-black text-white border-warm-black"
                        : "bg-transparent text-warm-black border-warm-border hover:border-warm-black"
                    }`}
                  >
                    A grade clone
                  </button>
                  {watch.variants.map((variant, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => { setSelectedVariant(variant); setSelectedMedia(0); }}
                      className={`px-4 py-2 text-xs tracking-wider uppercase transition-all border ${
                        selectedVariant?.name === variant.name
                          ? "bg-warm-black text-white border-warm-black"
                          : "bg-transparent text-warm-black border-warm-border hover:border-warm-black"
                      }`}
                    >
                      {variant.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Specs — editorial list */}
            {specs.length > 0 && (
              <div className="divide-y divide-warm-border border-t border-warm-border mb-8">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center py-3">
                    <span className="text-muted-warm text-[10px] tracking-[0.2em] uppercase">{label}</span>
                    <span className="text-warm-black text-sm font-light">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Description */}
            {currentDescription && (
              <p className="text-muted-warm text-sm font-light leading-relaxed mb-8">
                {currentDescription}
              </p>
            )}

            {/* Quantity + CTA */}
            <div className="mb-8 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center border border-warm-border">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 flex items-center justify-center text-muted-warm hover:text-warm-black transition-colors"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-warm-black text-sm border-x border-warm-border">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 flex items-center justify-center text-muted-warm hover:text-warm-black transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <button className="flex items-center gap-2 text-muted-warm hover:text-accent-orange text-xs tracking-wider uppercase transition-colors">
                  <Heart className="w-3.5 h-3.5" />
                  Save
                </button>
              </div>

              <button
                onClick={addToCart}
                className="w-full bg-warm-black text-white py-4 text-xs tracking-[0.2em] uppercase font-medium hover:bg-warm-black/90 transition-colors flex items-center justify-center gap-3"
              >
                <ShoppingBag className="w-4 h-4" />
                Add to Cart
              </button>
            </div>

            {/* Trust badges — horizontal inline */}
            <div className="border-t border-warm-border pt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-warm">
                <Shield className="w-4 h-4 text-amber-gold shrink-0" />
                <span className="text-[10px] tracking-[0.15em] uppercase">Authenticated</span>
              </div>
              <div className="w-px h-5 bg-warm-border" />
              <div className="flex items-center gap-2 text-muted-warm">
                <Truck className="w-4 h-4 text-amber-gold shrink-0" />
                <span className="text-[10px] tracking-[0.15em] uppercase">Free Shipping</span>
              </div>
              <div className="w-px h-5 bg-warm-border" />
              <div className="flex items-center gap-2 text-muted-warm">
                <RotateCcw className="w-4 h-4 text-amber-gold shrink-0" />
                <span className="text-[10px] tracking-[0.15em] uppercase">30-Day Returns</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Customer Reviews */}
      {productReviews.length > 0 && (
        <div className="bg-white border-t border-warm-border py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <p className="text-accent-orange text-[10px] tracking-[0.35em] uppercase font-semibold mb-2">
              Customer Reviews
            </p>
            <h2 className="text-2xl md:text-3xl font-extralight text-warm-black tracking-tight mb-10">
              What Our Clients Say
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {productReviews.map((review) => (
                <div
                  key={review.id}
                  className="bg-offwhite border border-warm-border rounded-xl p-6"
                >
                  <div className="flex items-center gap-0.5 mb-3">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < review.rating
                            ? "fill-amber-gold text-amber-gold"
                            : "fill-none text-warm-border"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-warm-black font-light leading-relaxed mb-4">
                    "{review.testimonial}"
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-warm-black">
                      {review.customer_name || "Verified Buyer"}
                    </p>
                    {review.purchase_date && (
                      <p className="text-[10px] text-muted-warm">
                        Purchased {review.purchase_date}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Related watches */}
      {displayRelated.length > 0 && (
        <div className="bg-offwhite border-t border-warm-border py-16 mt-4">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <p className="text-accent-orange text-[10px] tracking-[0.35em] uppercase font-semibold mb-2">
              You May Also Like
            </p>
            <h2 className="text-2xl md:text-3xl font-extralight text-warm-black tracking-tight mb-10">
              More from {watch.brand}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
              {displayRelated.map((w, i) => (
                <WatchCard key={w.id} watch={w} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
