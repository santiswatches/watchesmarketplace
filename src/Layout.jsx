import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { ShoppingBag, Menu, X, User, LogOut, Heart } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { api } from "@/services/api";
import { toast } from "sonner";
import CartDrawer from "./components/shared/CartDrawer";
import FavoritesDrawer from "./components/shared/FavoritesDrawer";
import Footer from "./components/shared/Footer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

const NAV_LINKS = [
  { label: "Catalog", page: "shop" },
  { label: "New Arrivals", page: "shop", params: "?category=new_arrival" },
  { label: "Bestsellers", page: "shop", params: "?category=bestseller" },
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
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToContact = (e) => {
    e.preventDefault();
    if (location.pathname === "/home" || location.pathname === "/") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      navigate("/home#contact");
    }
    setMobileMenuOpen(false);
  };

  // Handle hash scroll on page load / navigation
  useEffect(() => {
    if (location.hash === "#contact") {
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, [location]);

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("watch_cart");
    return saved ? JSON.parse(saved) : [];
  });
  const [cartOpen, setCartOpen] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const favoritesRef = useRef(favorites);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
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

  // Favorites: load from API when user is available
  useEffect(() => {
    if (!user) { setFavorites([]); return; }
    api.favorites.list()
      .then(setFavorites)
      .catch((err) => {
        console.error('[favorites] Load failed:', err.message);
        setFavorites([]);
      });
  }, [user]);

  // Keep ref in sync and notify child components
  useEffect(() => {
    favoritesRef.current = favorites;
    window.__favorites = favorites;
    window.dispatchEvent(new CustomEvent('favorites-changed'));
  }, [favorites]);

  // Expose stable global helpers (only recreate when user changes)
  useEffect(() => {
    window.__setFavorites = setFavorites;
    window.__openFavorites = () => setFavoritesOpen(true);
    window.__toggleFavorite = async (productId, productData) => {
      if (!user) { api.auth.redirectToLogin(); return; }
      const isFav = favoritesRef.current.some(f => f.product_id === productId);
      if (isFav) {
        setFavorites(prev => prev.filter(f => f.product_id !== productId));
        try {
          await api.favorites.remove(productId);
          const fresh = await api.favorites.list();
          setFavorites(fresh);
        } catch (err) {
          console.error('[favorites] Remove failed:', err.message);
          const fresh = await api.favorites.list().catch(() => favoritesRef.current);
          setFavorites(fresh);
          toast.error('Could not remove favorite');
        }
      } else {
        const optimistic = { product_id: productId, ...productData };
        setFavorites(prev => [optimistic, ...prev]);
        try {
          await api.favorites.add(productId);
          const fresh = await api.favorites.list();
          setFavorites(fresh);
        } catch (err) {
          console.error('[favorites] Add failed:', err.message);
          setFavorites(prev => prev.filter(f => f.product_id !== productId));
          toast.error('Could not save to favorites');
        }
      }
    };
    window.__isFavorite = (productId) => favoritesRef.current.some(f => f.product_id === productId);
  }, [user]);

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
        const currentUser = await api.auth.me();
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
    await api.auth.logout();
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
              <a
                href="#contact"
                onClick={scrollToContact}
                className="hidden md:block text-[11px] font-semibold tracking-widest uppercase text-warm-black hover:text-accent-orange transition-colors duration-200 cursor-pointer"
              >
                Contact
              </a>

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
                    onClick={() => api.auth.redirectToLogin(window.location.pathname)}
                    className="text-green-700 hover:text-green-900 transition-colors text-[11px] font-semibold tracking-widest uppercase"
                  >
                    Sign In
                  </button>
                )
              )}

              <button
                onClick={() => {
                  if (!user) { api.auth.redirectToLogin(); return; }
                  setFavoritesOpen(true);
                }}
                className="relative text-warm-black/70 hover:text-warm-black transition-colors"
              >
                <Heart className={`w-4 h-4 ${favorites.length > 0 ? "fill-accent-orange text-accent-orange" : ""}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-accent-orange text-white text-[9px] rounded-full flex items-center justify-center font-medium">
                    {favorites.length}
                  </span>
                )}
              </button>

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
                <a
                  href="#contact"
                  onClick={scrollToContact}
                  className="block text-[11px] font-semibold tracking-widest uppercase py-2 text-warm-black hover:text-accent-orange transition-colors cursor-pointer"
                >
                  Contact
                </a>
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

      <Footer />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} cart={cart} setCart={setCart} />

      {/* Favorites Drawer */}
      <FavoritesDrawer
        isOpen={favoritesOpen}
        onClose={() => setFavoritesOpen(false)}
        favorites={favorites}
        onRemove={async (productId) => {
          setFavorites(prev => prev.filter(f => f.product_id !== productId));
          try {
            await api.favorites.remove(productId);
            const fresh = await api.favorites.list();
            setFavorites(fresh);
          } catch (err) {
            console.error('[favorites] Remove failed:', err.message);
            const fresh = await api.favorites.list().catch(() => favoritesRef.current);
            setFavorites(fresh);
            toast.error('Could not remove favorite');
          }
        }}
        onAddToCart={(item) => {
          const existing = cart.find(c => c.id === item.product_id);
          if (existing) {
            setCart(prev => prev.map(c => c.id === item.product_id ? { ...c, quantity: c.quantity + 1 } : c));
          } else {
            setCart(prev => [...prev, {
              id: item.product_id,
              watch_id: item.product_id,
              name: item.name,
              brand: item.brand,
              price: item.price,
              image_url: item.image_url,
              quantity: 1,
            }]);
          }
          setFavoritesOpen(false);
          setCartOpen(true);
        }}
      />
    </div>
  );
}
