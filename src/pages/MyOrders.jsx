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
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  paid: "bg-green-100 text-green-700 border-green-300",
  shipped: "bg-blue-100 text-blue-700 border-blue-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  cancelled: "bg-red-100 text-red-600 border-red-300",
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
    <div className="bg-offwhite min-h-screen pt-20 md:pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        <Link
          to={createPageUrl("home")}
          className="inline-flex items-center gap-2 text-muted-warm hover:text-warm-black text-xs tracking-wide mb-8 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Home
        </Link>

        <h1 className="text-3xl text-warm-black font-light tracking-tight mb-10">My Orders</h1>

        {isLoading ? (
          <div className="space-y-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="animate-pulse bg-warm-border rounded-xl h-32" />
              ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-12 h-12 text-muted-warm mx-auto mb-4" />
            <p className="text-muted-warm text-lg font-light mb-2">No orders yet</p>
            <Link to={createPageUrl("shop")} className="text-accent-orange text-sm hover:underline">
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
                className="bg-white border border-warm-border rounded-xl p-6"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="text-warm-black text-sm font-medium">Order #{order.id?.slice(-8)}</p>
                      <Badge className={`${statusColors[order.status] || statusColors.pending} text-[10px] tracking-wider uppercase rounded-sm border`}>
                        {order.status}
                      </Badge>
                    </div>
                    <p className="text-muted-warm text-xs mt-1">
                      {order.created_date ? format(new Date(order.created_date), "MMM d, yyyy 'at' h:mm a") : ""}
                    </p>
                  </div>
                  <p className="text-accent-orange text-lg font-semibold">${order.total_amount?.toLocaleString()}</p>
                </div>

                <div className="flex gap-3 overflow-x-auto pb-2">
                  {order.items?.map((item, j) => (
                    <div key={j} className="flex items-center gap-3 flex-shrink-0">
                      <div className="w-12 h-12 bg-offwhite rounded-lg overflow-hidden border border-warm-border">
                        <img
                          src={item.image_url || "/assets/watches/panda_daytona-removebg-preview.png"}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-warm-black text-xs font-medium">{item.name}</p>
                        <p className="text-muted-warm text-[10px]">x{item.quantity}</p>
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
