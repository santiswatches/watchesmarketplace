import React from "react";
import { createPageUrl } from "../utils";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";

import HeroBanner from "../components/home/HeroBanner";
import WatchSection from "../components/home/WatchSection";
import FeaturedBrands from "../components/home/FeaturedBrands";
import CategoryGrid from "../components/home/CategoryGrid";
import Newsletter from "../components/home/Newsletter";

export default function Home() {
  const { data: watches = [], isLoading } = useQuery({
    queryKey: ["watches"],
    queryFn: () => api.watches.list({ sort_by: "newest" }),
  });

  const newArrivals = watches.filter((w) => w.category === "new_arrival").slice(0, 4);
  const saleWatches = watches.filter((w) => w.category === "sale").slice(0, 4);
  const bestsellers = watches.filter((w) => w.category === "bestseller").slice(0, 4);

  const addToCart = async (watch) => {
    const isAuthenticated = await api.auth.isAuthenticated();
    if (!isAuthenticated) {
      api.auth.redirectToLogin(window.location.pathname);
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

      <FeaturedBrands watches={watches} />

      <WatchSection
        title="New Arrivals"
        subtitle="Just Landed"
        watches={newArrivals.length > 0 ? newArrivals : watches.slice(0, 4)}
        categoryLink={createPageUrl("shop") + "?category=new_arrival"}
        onAddToCart={addToCart}
        altBg
      />

      <CategoryGrid />

      {saleWatches.length > 0 && (
        <WatchSection
          title="On Sale"
          subtitle="Limited Time"
          watches={saleWatches}
          categoryLink={createPageUrl("shop") + "?category=sale"}
          onAddToCart={addToCart}
          altBg
        />
      )}

      {bestsellers.length > 0 && (
        <WatchSection
          title="Bestsellers"
          subtitle="Most Popular"
          watches={bestsellers}
          categoryLink={createPageUrl("shop") + "?category=bestseller"}
          onAddToCart={addToCart}
        />
      )}

      <Newsletter />
    </div>
  );
}
