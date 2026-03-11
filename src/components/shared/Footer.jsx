import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "../../utils";

export default function Footer() {
  return (
    <footer className="bg-offwhite border-t border-warm-border pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <h3 className="font-condensed text-2xl font-bold uppercase tracking-widest text-warm-black mb-4">
              Santi's Watches
            </h3>
            <p className="text-muted-warm text-sm font-light leading-relaxed max-w-sm">
              Your trusted source for the finest luxury timepieces. Every watch in our collection is authenticated and comes with our promise of excellence.
            </p>
          </div>
          <div>
            <h4 className="font-condensed text-xs font-bold tracking-widest uppercase text-muted-warm mb-4">Quick Links</h4>
            <div className="space-y-3">
              {[{ label: "Home", page: "home" }, { label: "Reviews", page: "reviews" }, { label: "Shop", page: "shop" }].map(({ label, page }) => (
                <Link
                  key={page}
                  to={createPageUrl(page)}
                  className="block text-muted-warm hover:text-accent-orange text-sm transition-colors"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-condensed text-xs font-bold tracking-widest uppercase text-muted-warm mb-4">Support</h4>
            <div className="space-y-3 text-muted-warm text-sm">
              <p>santis.watches.managment@gmail.com</p>
              <p>+34 623 265 568</p>
            </div>
          </div>
        </div>
        <div className="border-t border-warm-border pt-8 text-center">
          <p className="text-muted-warm/60 text-xs tracking-wider">
            © 2026 Santi's Watches. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
