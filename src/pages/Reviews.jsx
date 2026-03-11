import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, StarHalf, User, Calendar, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchPublicReviews, fetchReviewStats } from "@/services/reviews";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

const REVIEWS_PER_PAGE = 8;

function DynamicStars({ rating, size = "sm" }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const empty = 5 - full - (hasHalf ? 1 : 0);
  const cls = size === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";

  return (
    <div className="flex items-center gap-0.5">
      {[...Array(full)].map((_, i) => (
        <Star key={`f${i}`} className={`${cls} fill-amber-gold text-amber-gold`} />
      ))}
      {hasHalf && <StarHalf className={`${cls} fill-amber-gold text-amber-gold`} />}
      {[...Array(empty)].map((_, i) => (
        <Star key={`e${i}`} className={`${cls} fill-none text-warm-border`} />
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function timeAgo(dateStr) {
  if (!dateStr) return null;
  try {
    const now = new Date();
    const d = new Date(dateStr);
    const diff = now - d;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 30) return `${days} days ago`;
    const months = Math.floor(days / 30);
    if (months === 1) return "1 month ago";
    if (months < 12) return `${months} months ago`;
    const years = Math.floor(months / 12);
    return years === 1 ? "1 year ago" : `${years} years ago`;
  } catch {
    return null;
  }
}

function ReviewCard({ review, index }) {
  const hasImage = !!review.product_image;
  const hasProduct = review.product_name || review.product_brand;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index * 0.04, 0.3) }}
      className="bg-white border border-warm-border rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      {/* Product image + brand strip */}
      {hasImage && (
        <Link
          to={createPageUrl("product-detail") + `?id=${review.product_id}`}
          className="block relative bg-offwhite"
        >
          <div className="h-48 flex items-center justify-center p-6">
            <img
              src={review.product_image}
              alt={review.product_name || "Watch"}
              className="max-h-full max-w-full object-contain"
              style={{ mixBlendMode: "multiply" }}
            />
          </div>
          {hasProduct && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/5 to-transparent px-5 pb-3 pt-6">
              <p className="text-[10px] tracking-[0.25em] uppercase font-semibold text-accent-orange">
                {review.product_brand}
              </p>
              <p className="text-xs text-warm-black font-medium truncate">
                {review.product_name}
              </p>
            </div>
          )}
        </Link>
      )}

      {/* Review body */}
      <div className="p-5">
        {/* Stars + time ago */}
        <div className="flex items-center justify-between mb-3">
          <DynamicStars rating={review.rating} />
          {review.submitted_at && (
            <span className="text-[10px] text-muted-warm flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(review.submitted_at)}
            </span>
          )}
        </div>

        {/* Testimonial */}
        <p className="text-sm text-warm-black font-light leading-relaxed mb-4">
          "{review.testimonial}"
        </p>

        {/* Product info (when no image) */}
        {!hasImage && hasProduct && (
          <Link
            to={createPageUrl("product-detail") + `?id=${review.product_id}`}
            className="mb-4 inline-block text-[10px] tracking-[0.15em] uppercase text-accent-orange hover:underline"
          >
            {review.product_brand} {review.product_name}
          </Link>
        )}

        {/* User info footer */}
        <div className="border-t border-warm-border pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-offwhite border border-warm-border flex items-center justify-center">
              <User className="w-3.5 h-3.5 text-muted-warm" />
            </div>
            <div>
              <p className="text-xs font-semibold text-warm-black leading-tight">
                {review.customer_name || "Verified Buyer"}
              </p>
              <p className="text-[10px] text-muted-warm">Verified Purchase</p>
            </div>
          </div>
          {review.purchase_date && (
            <div className="flex items-center gap-1 text-[10px] text-muted-warm">
              <Calendar className="w-3 h-3" />
              {formatDate(review.purchase_date)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Reviews() {
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PER_PAGE);
  const sentinelRef = useRef(null);

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["public-reviews"],
    queryFn: fetchPublicReviews,
    staleTime: 5 * 60 * 1000,
  });

  const { data: stats } = useQuery({
    queryKey: ["review-stats"],
    queryFn: fetchReviewStats,
    staleTime: 5 * 60 * 1000,
  });

  const average = stats?.average || 0;
  const count = stats?.count || 0;
  const hasMore = visibleCount < reviews.length;

  // Infinite scroll via IntersectionObserver
  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + REVIEWS_PER_PAGE, reviews.length));
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, reviews.length]);

  const visibleReviews = reviews.slice(0, visibleCount);

  return (
    <div className="bg-white min-h-screen pt-24 md:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        {/* Header — same pattern as Shop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4"
        >
          <div>
            <p className="font-sans text-[11px] font-semibold tracking-widest uppercase text-accent-orange mb-2">
              Testimonials
            </p>
            <h1 className="font-condensed text-2xl md:text-3xl font-bold uppercase tracking-tight text-warm-black">
              Customer Reviews
            </h1>
          </div>
          {count > 0 && (
            <div className="flex items-center gap-3">
              <span className="text-2xl font-extralight text-warm-black">{average.toFixed(1)}</span>
              <div className="flex flex-col gap-0.5">
                <DynamicStars rating={average} />
                <p className="text-[10px] text-muted-warm">
                  {count} review{count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Reviews list */}
        <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-warm-border border-t-warm-black rounded-full animate-spin" />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-muted-warm text-sm">No reviews yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleReviews.map((review, i) => (
                <ReviewCard key={review.id} review={review} index={i} />
              ))}
            </div>

            {/* Infinite scroll sentinel */}
            {hasMore && (
              <div ref={sentinelRef} className="flex items-center justify-center py-12">
                <div className="w-6 h-6 border-3 border-warm-border border-t-warm-black rounded-full animate-spin" />
              </div>
            )}

            {!hasMore && reviews.length > REVIEWS_PER_PAGE && (
              <p className="text-center text-xs text-muted-warm pt-10">
                You've seen all {reviews.length} reviews
              </p>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
