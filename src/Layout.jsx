import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ShoppingBag, Menu, X, User, Search, LogOut } from "lucide-react";
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
  { label: "Home", page: "Home" },
  { label: "Shop", page: "Shop" },
  { label: "New Arrivals", page: "Shop", params: "?category=new_arrival" },
  { label: "Sale", page: "Shop", params: "?category=sale" },
];

const ADMIN_LINKS = [
  { label: "Admin Dashboard", page: "Admin" },
];

export default function Layout({ children, currentPageName }) {
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
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
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
  const isHome = currentPageName === "Home";

  const adminEmails = ["admin112874@chronoluxe.com", "uberuhanunal@gmail.com", "templateseverlasting@gmail.com"];
  const isAdmin = user?.role === "admin" || (user?.email && adminEmails.includes(user.email));

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${scrolled || !isHome
            ? "bg-background/95 backdrop-blur-md border-b border-border"
            : "bg-transparent"
          }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <nav className="flex items-center justify-between h-16 md:h-20">
            {/* Left nav */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={createPageUrl(link.page) + (link.params || "")}
                  className={`text-xs tracking-[0.15em] uppercase transition-colors duration-300 ${link.label === "Sale"
                      ? "text-gold hover:text-gold-light"
                      : "text-muted-foreground hover:text-gold"
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-white/60 hover:text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Logo */}
            <Link
              to={createPageUrl("Home")}
              className="absolute left-1/2 -translate-x-1/2 text-foreground text-xl md:text-2xl tracking-[0.2em] uppercase font-light"
            >
              Santi's <span className="text-gold">Watches</span>
            </Link>

            {/* Right actions */}
            <div className="flex items-center gap-5">
              {isAdmin && (
                <Link
                  to={createPageUrl("Admin")}
                  className="hidden md:block text-gold hover:text-gold-light text-xs tracking-[0.15em] uppercase transition-colors duration-300"
                >
                  Admin
                </Link>
              )}
              <button className="hidden md:block text-white/60 hover:text-white transition-colors">
                <Search className="w-4 h-4" />
              </button>

              {!isLoadingUser && (
                user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <User className="w-4 h-4" />
                        <span className="hidden md:block text-xs">{user.full_name || user.email}</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#1A1A1A] border-white/10 text-white">
                      <DropdownMenuItem asChild className="focus:bg-white/10 cursor-pointer">
                        <Link to={createPageUrl("MyOrders")} className="flex items-center gap-2 text-xs">
                          <User className="w-3 h-3" /> My Orders
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-white/10" />
                      <DropdownMenuItem onClick={handleLogout} className="focus:bg-white/10 cursor-pointer">
                        <span className="flex items-center gap-2 text-xs">
                          <LogOut className="w-3 h-3" /> Logout
                        </span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <button
                    onClick={() => base44.auth.redirectToLogin(window.location.pathname)}
                    className="text-white/60 hover:text-white transition-colors text-xs tracking-[0.1em] uppercase"
                  >
                    Sign In
                  </button>
                )
              )}

              <button
                onClick={() => setCartOpen(true)}
                className="relative text-white/60 hover:text-white transition-colors"
              >
                <ShoppingBag className="w-4 h-4" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gold text-background text-[9px] rounded-full flex items-center justify-center font-medium">
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
              className="md:hidden bg-card border-t border-border overflow-hidden"
            >
              <div className="p-6 space-y-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={createPageUrl(link.page) + (link.params || "")}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`block text-sm tracking-[0.1em] uppercase py-2 transition-colors ${link.label === "Sale"
                        ? "text-gold hover:text-gold-light"
                        : "text-muted-foreground hover:text-gold"
                      }`}
                  >
                    {link.label}
                  </Link>
                ))}
                {isAdmin && ADMIN_LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={createPageUrl(link.page) + (link.params || "")}
                    onClick={() => setMobileMenuOpen(false)}
                    className="block text-gold hover:text-gold-light text-sm tracking-[0.1em] uppercase py-2 transition-colors"
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
      <footer className="bg-card border-t border-border pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="md:col-span-2">
              <h3 className="text-foreground text-xl tracking-[0.2em] uppercase font-light mb-4">
                Santi's <span className="text-gold">Watches</span>
              </h3>
              <p className="text-white/30 text-sm font-light leading-relaxed max-w-sm">
                Your trusted source for the finest luxury timepieces. Every watch in our collection
                is authenticated and comes with our promise of excellence.
              </p>
            </div>
            <div>
              <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4">Quick Links</h4>
              <div className="space-y-3">
                {["Home", "Shop"].map((page) => (
                  <Link
                    key={page}
                    to={createPageUrl(page)}
                    className="block text-muted-foreground hover:text-gold text-sm transition-colors"
                  >
                    {page}
                  </Link>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white/60 text-xs tracking-[0.2em] uppercase mb-4">Support</h4>
              <div className="space-y-3 text-white/30 text-sm">
                <p>contact@chronoluxe.com</p>
                <p>+1 (888) 555-0123</p>
                <p>Mon-Fri, 9am - 6pm EST</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-white/20 text-xs tracking-wider">
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
