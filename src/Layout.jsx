import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ShoppingBag, Menu, X, User, LogOut } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { base44 } from "@/services/api";
import CartDrawer from "./components/shared/CartDrawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { label: "Catalog", page: "shop" },
  { label: "Discover Your Watch", page: "shop", params: "?category=new_arrival" },
  { label: "Collections", page: "shop", params: "?category=bestseller" },
];

const ADMIN_LINKS = [
  { label: "Admin Dashboard", page: "admin" },
];

const STANDALONE_PAGES = ["review"];

export default function Layout({ children, currentPageName }) {
  // Standalone pages render without navbar/footer
  if (STANDALONE_PAGES.includes(currentPageName)) {
    return <>{children}</>;
  }
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("watch_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  useEffect(() => {
    localStorage.setItem("watch_cart", JSON.stringify(cart));
    window.__watchCart = cart;
    window.__setWatchCart = setCart;
    window.__openCart = () => setCartOpen(true);
  }, [cart]);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 40);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoadingUser(false);
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const adminEmails = ["admin112874@chronoluxe.com", "uberuhanunal@gmail.com", "templateseverlasting@gmail.com", "santis.watches.managment@gmail.com"];
  const isAdmin = user?.role === "admin" || (user?.email && adminEmails.includes(user.email));

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white border-b border-warm-border`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <nav className="flex items-center justify-between h-16 md:h-18">
            {/* Left nav links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={createPageUrl(link.page) + (link.params || "")}
                  className="text-[11px] font-semibold tracking-widest uppercase text-warm-black hover:text-accent-orange transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-warm-black/60 hover:text-warm-black"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo — centered */}
            <Link
              to={createPageUrl("home")}
              className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center leading-none"
            >
              <span className="font-condensed text-xl font-bold tracking-widest uppercase text-warm-black">
                Santi's
              </span>
              <span className="font-condensed text-[10px] font-semibold tracking-[0.35em] uppercase text-muted-warm">
                Watches
              </span>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-5">
              {isAdmin && (
                <Link
                  to={createPageUrl("admin")}
                  className="hidden md:block text-accent-orange hover:text-accent-orange/80 text-[11px] font-semibold tracking-widest uppercase transition-colors duration-200"
                >
                  Admin
                </Link>
              )}

              {/* Contact link */}
              <Link
                to={createPageUrl("shop")}
                className="hidden md:block text-[11px] font-semibold tracking-widest uppercase text-warm-black hover:text-accent-orange transition-colors duration-200"
              >
                Contact
              </Link>

              {!isLoadingUser && (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-warm-black/60 hover:text-warm-black transition-colors">
                        <User className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-white border-warm-border text-warm-black w-48 shadow-md">
                      <DropdownMenuItem asChild className="focus:bg-offwhite cursor-pointer">
                        <Link to={createPageUrl("profile")} className="flex items-center gap-2 text-sm px-4 py-2">
                          <User className="w-4 h-4" /> Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="focus:bg-offwhite cursor-pointer">
                        <Link to={createPageUrl("my-orders")} className="flex items-center gap-2 text-sm px-4 py-2">
                          <ShoppingBag className="w-4 h-4" /> My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-warm-border" />
                      <DropdownMenuItem onClick={handleLogout} className="focus:bg-offwhite cursor-pointer">
                        <span className="flex items-center gap-2 text-sm px-4 py-2 text-red-500 hover:text-red-400">
                          <LogOut className="w-4 h-4" /> Logout
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                    className="text-green-700 hover:text-green-900 transition-colors text-[11px] font-semibold tracking-widest uppercase"
                  >
                    Sign In
                  </button>
                )
              )}

              <button
                onClick={() => setCartOpen(true)}
                className="relative text-warm-black/70 hover:text-warm-black transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent-orange text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </nav>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-warm-border overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={createPageUrl(link.page) + (link.params || "")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-[11px] font-semibold tracking-widest uppercase py-2 text-warm-black hover:text-accent-orange transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && ADMIN_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={createPageUrl(link.page) + (link.params || "")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-accent-orange text-[11px] font-semibold tracking-widest uppercase py-2 transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-offwhite border-t border-warm-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h3 className="font-condensed text-2xl font-bold uppercase tracking-widest text-warm-black mb-4">
                Santi's Watches
              </h3>
              <p className="text-muted-warm text-sm font-light leading-relaxed max-w-sm">
                Your trusted source for the finest luxury timepieces. Every watch in our collection
                is authenticated and comes with our promise of excellence.
              </p>
            </div>
            <div>
              <h4 className="font-condensed text-xs font-bold tracking-widest uppercase text-muted-warm mb-4">Quick Links</h4>
              <div className="space-y-3">
                {[{ label: "Home", page: "home" }, { label: "Shop", page: "shop" }].map(({ label, page }) => (
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
                <p>contact@santiwatches.com</p>
                <p>+1 (888) 555-0123</p>
                <p>Mon-Fri, 9am - 6pm EST</p>
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

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} />
    </div>
  );
}
