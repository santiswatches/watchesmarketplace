import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

import HeroBanner from "../components/home/HeroBanner";
import WatchSection from "../components/home/WatchSection";
import FeaturedBanner from "../components/home/FeaturedBanner";
import Newsletter from "../components/home/Newsletter";

export default function Home() {
  const navigate = useNavigate();

  const { data: watches = [], isLoading } = useQuery({
    queryKey: ["watches"],
    queryFn: () => base44.entities.Watch.list("-created_date", 50),
  });

  const newArrivals = watches.filter((w) => w.category === "new_arrival").slice(0, 4);
  const saleWatches = watches.filter((w) => w.category === "sale").slice(0, 4);
  const bestsellers = watches.filter((w) => w.category === "bestseller").slice(0, 4);
  const featured = watches.filter((w) => w.featured).slice(0, 4);

  const addToCart = async (watch) => {
    const isAuthenticated = await base44.auth.isAuthenticated();
    if (!isAuthenticated) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }

    const cart = window.__watchCart || [];
    const existingIndex = cart.findIndex((item) => item.watch_id === watch.id);
    if (existingIndex >= 0) {
      const updated = [...cart];
      updated[existingIndex].quantity += 1;
      window.__setWatchCart?.(updated);
    } else {
      window.__setWatchCart?.([
        ...cart,
        {
          watch_id: watch.id,
          name: watch.name,
          brand: watch.brand,
          price: watch.price,
          image_url: watch.image_url,
          quantity: 1,
        },
      ]);
    }
    window.__openCart?.();
  };

  return (
    <div>
      <HeroBanner />

      <WatchSection
        title="New Arrivals"
        subtitle="Just Landed"
        watches={newArrivals.length > 0 ? newArrivals : watches.slice(0, 4)}
        categoryLink={createPageUrl("Shop") + "?category=new_arrival"}
        onAddToCart={addToCart}
      />

      <FeaturedBanner />

      {saleWatches.length > 0 && (
        <WatchSection
          title="On Sale"
          subtitle="Limited Time"
          watches={saleWatches}
          categoryLink={createPageUrl("Shop") + "?category=sale"}
          onAddToCart={addToCart}
        />
      )}

      {bestsellers.length > 0 && (
        <WatchSection
          title="Bestsellers"
          subtitle="Most Popular"
          watches={bestsellers}
          categoryLink={createPageUrl("Shop") + "?category=bestseller"}
          onAddToCart={addToCart}
        />
      )}

      <Newsletter />
    </div>
  );
}
