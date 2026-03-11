import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "../utils";
import { api } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { SlidersHorizontal, X, Search } from "lucide-react";
import WatchCard from "../components/shared/WatchCard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const BRANDS = ["All", "Rolex", "Omega", "Patek Philippe", "Audemars Piguet", "Cartier"];
const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "new_arrival", label: "New Arrivals" },
  { value: "sale", label: "On Sale" },
  { value: "bestseller", label: "Bestsellers" },
  { value: "limited_edition", label: "Limited Edition" },
];
const MATERIALS = ["All", "Gold", "Rose Gold", "Stainless Steel", "Titanium", "Platinum", "Ceramic"];
const SORT_OPTIONS = [
  { value: "newest", label: "Time: Newest to Oldest" },
  { value: "oldest", label: "Time: Oldest to Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "name_asc", label: "Name: A-Z" },
];

export default function Shop() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const initialBrand = urlParams.get("brand") || "All";
  const initialCategory = urlParams.get("category") || "all";
  const initialMaterial = urlParams.get("material") || "All";

  const [brand, setBrand] = useState(initialBrand);
  const [category, setCategory] = useState(initialCategory);
  const [material, setMaterial] = useState(initialMaterial);
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setBrand(params.get("brand") || "All");
    setCategory(params.get("category") || "all");
    setMaterial(params.get("material") || "All");
  }, [location.search]);

  const { data: watches = [], isLoading } = useQuery({
    queryKey: ["watches-shop"],
    queryFn: () => api.watches.list(),
  });

  const filteredWatches = useMemo(() => {
    let result = [...watches];
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter(w => (w.name?.toLowerCase().includes(q)) || (w.brand?.toLowerCase().includes(q)) || (w.description?.toLowerCase().includes(q)));
    }
    if (brand !== "All") result = result.filter((w) => w.brand === brand);
    if (category !== "all") result = result.filter((w) => w.category === category);
    if (material !== "All") result = result.filter((w) => w.material === material || w.name?.includes(material));

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
      case "newest":
        result.sort((a, b) => new Date(b.created_date || 0) - new Date(a.created_date || 0));
        break;
      case "oldest":
        result.sort((a, b) => new Date(a.created_date || 0) - new Date(b.created_date || 0));
        break;
      default:
        break;
    }
    return result;
  }, [watches, brand, category, material, sort, searchQuery]);

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
        { watch_id: watch.id, name: watch.name, brand: watch.brand, price: watch.price, image_url: watch.image_url, quantity: 1 },
      ]);
    }
    window.__openCart?.();
  };

  const hasActiveFilters = brand !== "All" || category !== "all" || material !== "All" || searchQuery !== "";

  return (
    <div className="bg-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <p className="font-sans text-[11px] font-semibold tracking-widest uppercase text-accent-orange mb-2">Collection</p>
          <h1 className="font-condensed text-4xl md:text-6xl font-bold uppercase tracking-tight text-warm-black">
            Our Timepieces
          </h1>
        </motion.div>

        {/* Filters Bar */}
        <div className="sticky top-16 md:top-[4.5rem] z-30 bg-white border-b border-warm-border pb-4 mb-8 -mx-6 px-6 lg:-mx-12 lg:px-12">
          {/* Search Bar */}
          <div className="flex items-center gap-4 mt-4 mb-4">
            <div className="flex items-center gap-3 flex-1 max-w-md bg-white border border-warm-border rounded-full px-5 py-2.5 shadow-sm">
              <Search className="w-4 h-4 text-muted-warm flex-shrink-0" />
              <input
                type="text"
                placeholder="Search timepieces..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 outline-none text-sm font-sans text-warm-black placeholder:text-muted-warm bg-transparent"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")}>
                  <X className="w-3.5 h-3.5 text-muted-warm hover:text-warm-black" />
                </button>
              )}
            </div>

            {/* Mobile filter toggle */}
            <button
              className="md:hidden flex items-center gap-2 px-4 py-2.5 border border-warm-border rounded-full text-warm-black text-[11px] font-semibold tracking-widest uppercase bg-white"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            {/* Brand pills — desktop */}
            <div className="hidden md:flex items-center gap-2 flex-wrap">
              {BRANDS.map((b) => (
                <button
                  key={b}
                  onClick={() => setBrand(b)}
                  className={`px-4 py-1.5 text-[11px] font-semibold tracking-wide uppercase rounded-full border transition-all duration-200 ${brand === b
                    ? "bg-accent-orange text-white border-accent-orange"
                    : "bg-offwhite text-warm-black border-warm-border hover:border-accent-orange"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>

            {/* Category & Sort — right aligned */}
            <div className="flex items-center gap-3 ml-auto">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-40 bg-white border-warm-border text-warm-black text-xs rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-warm-border">
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="text-warm-black text-xs focus:bg-offwhite">
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={material} onValueChange={setMaterial}>
                <SelectTrigger className="w-40 bg-white border-warm-border text-warm-black text-xs rounded-full">
                  <SelectValue placeholder="Material" />
                </SelectTrigger>
                <SelectContent className="bg-white border-warm-border">
                  {MATERIALS.map((m) => (
                    <SelectItem key={m} value={m} className="text-warm-black text-xs focus:bg-offwhite">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-44 bg-white border-warm-border text-warm-black text-xs rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-warm-border">
                  {SORT_OPTIONS.map((s) => (
                    <SelectItem key={s.value} value={s.value} className="text-warm-black text-xs focus:bg-offwhite">
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Mobile Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="md:hidden mb-6 flex flex-wrap gap-2"
          >
            {BRANDS.map((b) => (
              <button
                key={b}
                onClick={() => setBrand(b)}
                className={`px-3 py-1.5 text-[11px] font-semibold tracking-wide uppercase rounded-full border transition-all ${brand === b
                  ? "bg-accent-orange text-white border-accent-orange"
                  : "bg-offwhite text-warm-black border-warm-border"
                }`}
              >
                {b}
              </button>
            ))}
          </motion.div>
        )}

        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <span className="font-sans text-[11px] font-semibold tracking-widest uppercase text-muted-warm">Active filters:</span>
            {brand !== "All" && (
              <button
                onClick={() => setBrand("All")}
                className="flex items-center gap-1 px-3 py-1 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-[11px] font-semibold rounded-full"
              >
                {brand} <X className="w-3 h-3" />
              </button>
            )}
            {category !== "all" && (
              <button
                onClick={() => setCategory("all")}
                className="flex items-center gap-1 px-3 py-1 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-[11px] font-semibold rounded-full"
              >
                {CATEGORIES.find((c) => c.value === category)?.label} <X className="w-3 h-3" />
              </button>
            )}
            {material !== "All" && (
              <button
                onClick={() => setMaterial("All")}
                className="flex items-center gap-1 px-3 py-1 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-[11px] font-semibold rounded-full"
              >
                {material} <X className="w-3 h-3" />
              </button>
            )}
            {searchQuery !== "" && (
              <button
                onClick={() => setSearchQuery("")}
                className="flex items-center gap-1 px-3 py-1 bg-accent-orange/10 border border-accent-orange/30 text-accent-orange text-[11px] font-semibold rounded-full"
              >
                Search: {searchQuery} <X className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Results Count */}
        <p className="font-sans text-xs text-muted-warm mb-8">
          {filteredWatches.length} timepiece{filteredWatches.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {Array(8)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-offwhite rounded-xl" />
                  <div className="mt-4 space-y-2">
                    <div className="h-3 bg-offwhite rounded w-16" />
                    <div className="h-4 bg-offwhite rounded w-32" />
                    <div className="h-3 bg-offwhite rounded w-20" />
                  </div>
                </div>
              ))}
          </div>
        ) : filteredWatches.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-condensed text-2xl font-bold uppercase text-warm-black/30">No watches found</p>
            <p className="font-sans text-sm text-muted-warm mt-2">Try adjusting your filters</p>
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
