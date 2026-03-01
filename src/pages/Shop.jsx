import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "../utils";
import { base44 } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";
import WatchCard from "../components/shared/WatchCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BRANDS = ["All", "Rolex", "Omega", "Tag Heuer", "Cartier", "Breitling", "Patek Philippe"];
const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "new_arrival", label: "New Arrivals" },
  { value: "sale", label: "On Sale" },
  { value: "bestseller", label: "Bestsellers" },
  { value: "limited_edition", label: "Limited Edition" },
];
const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A-Z" },
];

export default function Shop() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(window.location.search);
  const initialBrand = urlParams.get("brand") || "All";
  const initialCategory = urlParams.get("category") || "all";

  const [brand, setBrand] = useState(initialBrand);
  const [category, setCategory] = useState(initialCategory);
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  const { data: watches = [], isLoading } = useQuery({
    queryKey: ["watches-shop"],
    queryFn: () => base44.entities.Watch.list("-created_date", 100),
  });

  const filteredWatches = useMemo(() => {
    let result = [...watches];
    if (brand !== "All") result = result.filter((w) => w.brand === brand);
    if (category !== "all") result = result.filter((w) => w.category === category);

    switch (sort) {
      case "price_asc":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price_desc":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name_asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      default:
        break;
    }
    return result;
  }, [watches, brand, category, sort]);

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
        { watch_id: watch.id, name: watch.name, brand: watch.brand, price: watch.price, image_url: watch.image_url, quantity: 1 },
      ]);
    }
    window.__openCart?.();
  };

  const hasActiveFilters = brand !== "All" || category !== "all";

  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-24 md:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="text-[#C9A962] tracking-[0.3em] uppercase text-xs mb-2">Collection</p>
          <h1 className="text-3xl md:text-5xl text-white font-light tracking-tight">
            Our Timepieces
          </h1>
        </motion.div>

        {/* Filters Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-10 border-b border-white/5 pb-6">
          {/* Brand pills (desktop) */}
          <div className="hidden md:flex items-center gap-2 flex-wrap">
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-4 py-2 text-xs tracking-[0.1em] uppercase transition-all duration-300 rounded-sm ${
                  brand === b
                    ? "bg-[#C9A962] text-[#0A0A0A] font-medium"
                    : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Mobile filter toggle */}
          <button
            className="md:hidden flex items-center gap-2 px-4 py-2 border border-white/10 text-white/60 text-xs tracking-[0.1em] uppercase"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Filters
          </button>

          {/* Category & Sort */}
          <div className="flex items-center gap-3 ml-auto">
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-40 bg-white/5 border-white/10 text-white/70 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                {CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value} className="text-white/70 text-xs focus:bg-white/10 focus:text-white">
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={setSort}>
              <SelectTrigger className="w-44 bg-white/5 border-white/10 text-white/70 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1A1A1A] border-white/10">
                {SORT_OPTIONS.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-white/70 text-xs focus:bg-white/10 focus:text-white">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden mb-8 flex flex-wrap gap-2"
          >
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-3 py-1.5 text-[10px] tracking-[0.1em] uppercase rounded-sm ${
                  brand === b
                    ? "bg-[#C9A962] text-[#0A0A0A]"
                    : "bg-white/5 text-white/50"
                }`}
              >
                {b}
              </button>
            ))}
          </motion.div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 mb-6">
            <span className="text-white/30 text-xs">Active filters:</span>
            {brand !== "All" && (
              <button
                onClick={() => setBrand("All")}
                className="flex items-center gap-1 px-3 py-1 bg-[#C9A962]/10 text-[#C9A962] text-xs rounded-sm"
              >
                {brand} <X className="w-3 h-3" />
              </button>
            )}
            {category !== "all" && (
              <button
                onClick={() => setCategory("all")}
                className="flex items-center gap-1 px-3 py-1 bg-[#C9A962]/10 text-[#C9A962] text-xs rounded-sm"
              >
                {CATEGORIES.find((c) => c.value === category)?.label} <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className="text-white/30 text-xs mb-8">
          {filteredWatches.length} timepiece{filteredWatches.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-white/5 rounded-sm" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-white/5 rounded w-16" />
                    <div className="h-4 bg-white/5 rounded w-32" />
                    <div className="h-3 bg-white/5 rounded w-20" />
                  </div>
                </div>
              ))}
          </div>
        ) : filteredWatches.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/30 text-lg font-light">No watches found</p>
            <p className="text-white/20 text-sm mt-2">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredWatches.map((watch, i) => (
              <WatchCard key={watch.id} watch={watch} index={i} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
