import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

const SHADOW = { filter: "drop-shadow(0 16px 36px rgba(0,0,0,0.15))" };

// Soft sage for featured (EXPLORE) cards — complements green accent
const FEATURED_BG = "#D6E4D9";
// Neutral light for secondary cards
const SECONDARY_BG = "#EDECEA";

// Map brand names (lowercase) to their local images
const BRAND_IMAGES = {
  "rolex": "/assets/watches/panda_daytona-removebg-preview.png",
  "audemars piguet": "/assets/watches/ap_black_dial-removebg-preview.png",
  "cartier": "/assets/watches/cartier_santos_white_dial-removebg-preview.png",
  "patek philippe": "/assets/watches/patek_nautilus-removebg-preview.png",
  "omega": "/assets/watches/green_dial_datejust_rolex-removebg-preview.png",
};

// Priority order for layout
const BRAND_PRIORITY = ["rolex", "audemars piguet", "cartier", "patek philippe", "omega"];

function getBrandImage(brand, watches) {
  const key = brand.toLowerCase();
  if (BRAND_IMAGES[key]) return BRAND_IMAGES[key];
  // Fallback: use the first watch image from that brand
  const watch = watches.find((w) => w.brand === brand);
  return watch?.image_url || null;
}

export default function FeaturedBrands({ watches = [] }) {
  const { brandCounts, availableBrands } = useMemo(() => {
    const counts = {};
    watches.forEach((w) => {
      if (w.brand) {
        counts[w.brand] = (counts[w.brand] || 0) + 1;
      }
    });

    const brandNames = Object.keys(counts);

    // Sort by priority first, then by count
    const ordered = [];

    // Add priority brands first (case-insensitive match)
    BRAND_PRIORITY.forEach((priorityKey) => {
      const match = brandNames.find((b) => b.toLowerCase() === priorityKey);
      if (match) ordered.push(match);
    });

    // Add remaining brands not in priority list, sorted by count
    brandNames
      .filter((b) => !ordered.includes(b))
      .sort((a, b) => counts[b] - counts[a])
      .forEach((b) => ordered.push(b));

    // Pad with priority brands that have images but aren't in the DB
    if (ordered.length < 4) {
      BRAND_PRIORITY.forEach((priorityKey) => {
        if (ordered.length >= 4) return;
        const alreadyIncluded = ordered.some(
          (b) => b.toLowerCase() === priorityKey
        );
        if (!alreadyIncluded && BRAND_IMAGES[priorityKey]) {
          ordered.push(
            priorityKey.split(" ").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
          );
        }
      });
    }

    return { brandCounts: counts, availableBrands: ordered.slice(0, 4) };
  }, [watches]);

  if (availableBrands.length === 0) return null;

  // First brand = featured (wide), second = tall, rest = secondary
  const featured = availableBrands[0];
  const tall = availableBrands[1];
  const secondaryBrands = availableBrands.slice(2, 4);

  return (
    <section className="bg-white py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">

        {/* Section header */}
        <p className="font-condensed text-center text-3xl md:text-4xl font-bold uppercase tracking-widest text-warm-black mb-12">
          Featured Brands
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">

          {/* ── Featured brand — wide card ── */}
          {featured && (
            <div className="col-span-2 md:col-span-2 md:col-start-1 md:row-start-1">
              <Link
                to={createPageUrl("shop") + "?brand=" + encodeURIComponent(featured)}
                className="group flex items-center justify-between rounded-2xl overflow-hidden p-7 md:p-9 h-full hover:shadow-lg transition-shadow duration-300"
                style={{ backgroundColor: FEATURED_BG, minHeight: "220px" }}
              >
                <div className="flex flex-col gap-2 z-10">
                  <p className="font-condensed text-3xl font-bold uppercase tracking-wide text-warm-black">
                    {featured}
                  </p>
                  <p className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-warm-black/55">
                    {brandCounts[featured] != null
                      ? `${brandCounts[featured]} ${brandCounts[featured] === 1 ? "Model" : "Models"}`
                      : "Coming Soon"}
                  </p>
                  <span className="mt-5 inline-block bg-accent-orange text-white font-sans text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 w-fit hover:bg-accent-orange/90 transition-colors">
                    Explore
                  </span>
                </div>
                {getBrandImage(featured, watches) && (
                  <div className="w-44 h-44 md:w-52 md:h-52 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={getBrandImage(featured, watches)}
                      alt={featured}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out select-none"
                      style={SHADOW}
                    />
                  </div>
                )}
              </Link>
            </div>
          )}

          {/* ── Tall brand — spans 2 rows on desktop ── */}
          {tall && (
            <div className="col-span-2 md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-2">
              <Link
                to={createPageUrl("shop") + "?brand=" + encodeURIComponent(tall)}
                className="group flex flex-col justify-between rounded-2xl overflow-hidden p-6 h-full hover:shadow-lg transition-shadow duration-300"
                style={{ backgroundColor: SECONDARY_BG, minHeight: "200px" }}
              >
                <div>
                  <p className="font-condensed text-2xl font-bold uppercase tracking-wide text-warm-black">
                    {tall}
                  </p>
                  <p className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-warm-black/50 mt-1.5">
                    {brandCounts[tall] != null
                      ? `${brandCounts[tall]} ${brandCounts[tall] === 1 ? "Model" : "Models"}`
                      : "Coming Soon"}
                  </p>
                </div>
                {getBrandImage(tall, watches) && (
                  <div className="flex-1 flex items-center justify-center py-6">
                    <img
                      src={getBrandImage(tall, watches)}
                      alt={tall}
                      className="w-full max-w-[200px] object-contain group-hover:scale-105 transition-transform duration-500 ease-out select-none"
                      style={SHADOW}
                    />
                  </div>
                )}
                <span className="inline-block bg-accent-orange text-white font-sans text-[11px] font-bold tracking-widest uppercase px-5 py-2.5 w-fit hover:bg-accent-orange/90 transition-colors">
                  Explore
                </span>
              </Link>
            </div>
          )}

          {/* ── Secondary brands ── */}
          {secondaryBrands.map((brand, i) => (
            <div
              key={brand}
              className={`${i === 0 ? "md:col-start-1" : "md:col-start-2"} md:row-start-2`}
            >
              <Link
                to={createPageUrl("shop") + "?brand=" + encodeURIComponent(brand)}
                className="group flex items-center justify-between rounded-2xl overflow-hidden p-5 h-full hover:shadow-lg transition-shadow duration-300"
                style={{ backgroundColor: SECONDARY_BG, minHeight: "180px" }}
              >
                <div className="flex flex-col gap-1.5">
                  <p className="font-condensed text-xl font-bold uppercase tracking-wide text-warm-black">
                    {brand}
                  </p>
                  <p className="font-sans text-[11px] font-bold tracking-[0.25em] uppercase text-warm-black/50">
                    {brandCounts[brand] != null
                      ? `${brandCounts[brand]} ${brandCounts[brand] === 1 ? "Model" : "Models"}`
                      : "Coming Soon"}
                  </p>
                </div>
                {getBrandImage(brand, watches) && (
                  <div className="w-28 h-28 flex-shrink-0 flex items-center justify-center">
                    <img
                      src={getBrandImage(brand, watches)}
                      alt={brand}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out select-none"
                      style={SHADOW}
                    />
                  </div>
                )}
              </Link>
            </div>
          ))}

        </div>
      </div>
    </section>
  );
}