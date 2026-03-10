import React from "react";
import { base44 } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "../utils";
import { motion } from "framer-motion";
import { Package, ChevronLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusColors = {
  pending: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  paid: "bg-green-500/10 text-green-400 border-green-500/20",
  shipped: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  delivered: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  cancelled: "bg-red-500/10 text-red-400 border-red-500/20",
};

export default function MyOrders() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["my-orders"],
    queryFn: async () => {
      const isAuthenticated = await base44.auth.isAuthenticated();
      if (!isAuthenticated) {
        base44.auth.redirectToLogin(createPageUrl("my-orders"));
        return [];
      }

      const user = await base44.auth.me();
      const allOrders = await base44.entities.Order.list("-created_date", 100);
      return allOrders.filter(order => order.customer_email === user.email);
    },
  });

  return (
    <div className="bg-background min-h-screen pt-20 md:pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <Link
          to={createPageUrl("home")}
          className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 text-xs tracking-wide mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl text-foreground font-light tracking-tight mb-10">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse bg-white/5 rounded-sm h-32" />
              ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg font-light mb-2">No orders yet</p>
            <Link to={createPageUrl("shop")} className="text-gold text-sm hover:underline">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card border border-border/50 rounded-sm p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-white text-sm">Order #{order.id?.slice(-8)}</p>
                      <Badge className={`${statusColors[order.status] || statusColors.pending} text-[10px] tracking-wider uppercase rounded-none border`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-white/30 text-xs mt-1">
                      {order.created_date ? format(new Date(order.created_date), "MMM d, yyyy 'at' h:mm a") : ""}
                    </p>
                  </div>
                  <p className="text-gold text-lg font-light">${order.total_amount?.toLocaleString()}</p>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {order.items?.map((item, j) => (
                    <div key={j} className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-12 h-12 bg-[#1A1A1A] rounded-sm overflow-hidden">
                        <img
                          src={item.image_url || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=200&q=80"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-white text-xs">{item.name}</p>
                        <p className="text-white/30 text-[10px]">x{item.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
