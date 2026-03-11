import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Send, CheckCircle, Filter, Mail, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { fetchAdminOrders, sendReviewEmail, updateOrder } from "@/services/orders";

const statusColors = {
  pending: "bg-yellow-100 text-yellow-700 border-yellow-300",
  paid: "bg-green-100 text-green-700 border-green-300",
  shipped: "bg-blue-100 text-blue-700 border-blue-300",
  delivered: "bg-emerald-100 text-emerald-700 border-emerald-300",
  cancelled: "bg-red-100 text-red-600 border-red-300",
};

const ALL_STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

export default function OrdersManager() {
  const [statusFilter, setStatusFilter] = useState("all");
  const [reviewFilter, setReviewFilter] = useState("all");

  // Review request dialog
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [sendingReview, setSendingReview] = useState(false);

  // Edit order dialog
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editOrder, setEditOrder] = useState(null);
  const [editStatus, setEditStatus] = useState("");

  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["admin-orders", statusFilter, reviewFilter],
    queryFn: () =>
      fetchAdminOrders({
        status: statusFilter !== "all" ? statusFilter : undefined,
        review_sent: reviewFilter === "not_sent" ? 0 : reviewFilter === "sent" ? 1 : undefined,
      }),
  });

  const sendMutation = useMutation({
    mutationFn: ({ orderId, productId }) => sendReviewEmail(orderId, productId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success(`Review email sent to ${data.email_sent_to}`);
      setSendingReview(false);
      setShowReviewDialog(false);
    },
    onError: (err) => {
      toast.error(err.message);
      setSendingReview(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ orderId, data }) => updateOrder(orderId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order updated");
      setShowEditDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const openReviewDialog = (order) => {
    setReviewOrder(order);
    // Auto-select if single item
    setSelectedProductId(order.items?.length === 1 ? order.items[0].product_id : null);
    setShowReviewDialog(true);
  };

  const handleConfirmSend = () => {
    if (!reviewOrder) return;
    setSendingReview(true);
    sendMutation.mutate({ orderId: reviewOrder.id, productId: selectedProductId });
  };

  const openEditDialog = (order) => {
    setEditOrder(order);
    setEditStatus(order.status);
    setShowEditDialog(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editOrder) return;
    updateMutation.mutate({ orderId: editOrder.id, data: { status: editStatus } });
  };

  const selectedItem = reviewOrder?.items?.find((i) => i.product_id === selectedProductId);

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <Filter className="w-4 h-4 text-muted-warm" />
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 border-warm-border text-warm-black text-xs">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent className="bg-white border-warm-border">
            <SelectItem value="all" className="text-warm-black focus:bg-offwhite text-xs">All Statuses</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s} className="text-warm-black focus:bg-offwhite text-xs capitalize">{s}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={reviewFilter} onValueChange={setReviewFilter}>
          <SelectTrigger className="w-44 border-warm-border text-warm-black text-xs">
            <SelectValue placeholder="Review status" />
          </SelectTrigger>
          <SelectContent className="bg-white border-warm-border">
            <SelectItem value="all" className="text-warm-black focus:bg-offwhite text-xs">All Orders</SelectItem>
            <SelectItem value="not_sent" className="text-warm-black focus:bg-offwhite text-xs">Review Not Sent</SelectItem>
            <SelectItem value="sent" className="text-warm-black focus:bg-offwhite text-xs">Review Sent</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-xs text-muted-warm ml-auto">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
      </div>

      {/* Orders list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-warm-border rounded-xl h-28" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white border border-warm-border rounded-xl p-12 text-center">
          <p className="text-muted-warm">No orders found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-warm-border rounded-xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Order info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <p className="text-sm font-medium text-warm-black">
                      Order #{order.id?.slice(-8)}
                    </p>
                    <Badge className={`${statusColors[order.status] || statusColors.pending} text-[10px] tracking-wider uppercase rounded-sm border`}>
                      {order.status}
                    </Badge>
                    {order.review_sent ? (
                      <span className="flex items-center gap-1 text-[10px] text-accent-orange font-semibold">
                        <Mail className="w-3 h-3" /> Review sent
                      </span>
                    ) : null}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-warm">
                    <span>{order.customer_name || "—"}</span>
                    <span>{order.customer_email}</span>
                    <span>
                      {order.created_date
                        ? new Date(order.created_date).toLocaleDateString()
                        : "—"}
                    </span>
                  </div>

                  {/* Items */}
                  {order.items?.length > 0 && (
                    <div className="flex gap-2 mt-3 overflow-x-auto">
                      {order.items.map((item, j) => (
                        <div key={j} className="flex items-center gap-2 flex-shrink-0 bg-offwhite rounded-lg px-3 py-1.5">
                          {item.image_url && (
                            <img
                              src={item.image_url}
                              alt=""
                              className="w-8 h-8 object-contain rounded"
                            />
                          )}
                          <div>
                            <p className="text-[10px] text-accent-orange font-semibold uppercase tracking-wider">
                              {item.watch_brand}
                            </p>
                            <p className="text-xs text-warm-black">{item.watch_name}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right side: total + actions */}
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <p className="text-lg font-semibold text-warm-black">
                    ${order.total?.toLocaleString()}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Button
                      onClick={() => openEditDialog(order)}
                      variant="outline"
                      size="sm"
                      className="border-warm-border text-warm-black hover:bg-offwhite gap-1.5 text-xs"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Button>
                    {!order.review_sent ? (
                      <Button
                        onClick={() => openReviewDialog(order)}
                        className="bg-accent-orange text-white hover:bg-accent-orange/90 gap-1.5 text-xs"
                        size="sm"
                      >
                        <Send className="w-3 h-3" /> Request Review
                      </Button>
                    ) : (
                      <span className="flex items-center gap-1.5 text-xs text-accent-orange font-medium px-2">
                        <CheckCircle className="w-3.5 h-3.5" /> Sent
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ── Review Request Preview Dialog ── */}
      <Dialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <DialogContent className="bg-white border-warm-border text-warm-black max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-warm-black">Request Review</DialogTitle>
          </DialogHeader>
          {reviewOrder && (
            <div className="space-y-5 mt-2">
              {/* Customer info */}
              <div className="bg-offwhite rounded-lg p-4">
                <p className="text-[10px] text-muted-warm uppercase tracking-wider mb-1">Sending to</p>
                <p className="text-sm font-medium text-warm-black">{reviewOrder.customer_name || "—"}</p>
                <p className="text-xs text-muted-warm">{reviewOrder.customer_email}</p>
              </div>

              {/* Watch selection */}
              {reviewOrder.items?.length > 1 && (
                <div>
                  <Label className="text-muted-warm text-xs">Select watch to review</Label>
                  <div className="space-y-2 mt-2">
                    {reviewOrder.items.map((item) => (
                      <button
                        key={item.product_id}
                        type="button"
                        onClick={() => setSelectedProductId(item.product_id)}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                          selectedProductId === item.product_id
                            ? "border-accent-orange bg-accent-orange/5"
                            : "border-warm-border hover:bg-offwhite"
                        }`}
                      >
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="w-10 h-10 object-contain rounded" />
                        )}
                        <div className="flex-1">
                          <p className="text-[10px] text-accent-orange font-semibold uppercase tracking-wider">
                            {item.watch_brand}
                          </p>
                          <p className="text-sm text-warm-black">{item.watch_name}</p>
                        </div>
                        <p className="text-xs text-muted-warm">${item.price?.toLocaleString()}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Single item display */}
              {reviewOrder.items?.length === 1 && (
                <div>
                  <Label className="text-muted-warm text-xs">Watch</Label>
                  <div className="flex items-center gap-3 mt-2 p-3 rounded-lg border border-accent-orange bg-accent-orange/5">
                    {reviewOrder.items[0].image_url && (
                      <img src={reviewOrder.items[0].image_url} alt="" className="w-10 h-10 object-contain rounded" />
                    )}
                    <div>
                      <p className="text-[10px] text-accent-orange font-semibold uppercase tracking-wider">
                        {reviewOrder.items[0].watch_brand}
                      </p>
                      <p className="text-sm text-warm-black">{reviewOrder.items[0].watch_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Email preview */}
              <div>
                <Label className="text-muted-warm text-xs">Email preview</Label>
                <div className="mt-2 border border-warm-border rounded-lg overflow-hidden">
                  <div className="bg-offwhite px-4 py-3 border-b border-warm-border">
                    <p className="text-[10px] text-muted-warm">
                      <span className="font-semibold">Subject:</span> How's your new watch? Share your experience with Santi's Watches
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <p className="text-sm text-warm-black font-light">
                      Thank you for your purchase, <span className="font-medium">{reviewOrder.customer_name || "valued customer"}</span>!
                    </p>
                    <p className="text-xs text-muted-warm leading-relaxed">
                      We hope you're enjoying your new timepiece. Your feedback means the world to us — would you take a moment to share your experience?
                    </p>
                    <div className="bg-offwhite rounded-md p-3">
                      <p className="text-[10px] text-muted-warm font-semibold uppercase tracking-wider mb-1">Your Order</p>
                      {selectedProductId ? (
                        <p className="text-xs text-warm-black">
                          {selectedItem?.watch_brand} {selectedItem?.watch_name}
                        </p>
                      ) : reviewOrder.items?.length > 1 ? (
                        <p className="text-xs text-muted-warm italic">Select a watch above</p>
                      ) : (
                        <p className="text-xs text-warm-black">
                          {reviewOrder.items?.[0]?.watch_brand} {reviewOrder.items?.[0]?.watch_name}
                        </p>
                      )}
                    </div>
                    <div className="text-center pt-1">
                      <span className="inline-block bg-accent-orange text-white text-[10px] font-semibold uppercase tracking-wider px-5 py-2 rounded-md">
                        Share Your Experience
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReviewDialog(false)}
                  className="flex-1 border-warm-border text-warm-black hover:bg-offwhite"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleConfirmSend}
                  disabled={sendingReview || (!selectedProductId && reviewOrder.items?.length > 1)}
                  className="flex-1 bg-accent-orange text-white hover:bg-accent-orange/90 gap-1.5"
                >
                  {sendingReview ? (
                    "Sending..."
                  ) : (
                    <><Send className="w-3.5 h-3.5" /> Send Email</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Edit Order Dialog ── */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white border-warm-border text-warm-black max-w-md">
          <DialogHeader>
            <DialogTitle className="text-warm-black">Edit Order</DialogTitle>
          </DialogHeader>
          {editOrder && (
            <form onSubmit={handleEditSubmit} className="space-y-5 mt-2">
              {/* Order ID */}
              <div>
                <Label className="text-muted-warm text-xs">Order ID</Label>
                <p className="text-sm text-warm-black font-mono mt-1">{editOrder.id}</p>
              </div>

              {/* Customer */}
              <div>
                <Label className="text-muted-warm text-xs">Customer</Label>
                <p className="text-sm text-warm-black mt-1">{editOrder.customer_name || "—"}</p>
                <p className="text-xs text-muted-warm">{editOrder.customer_email}</p>
              </div>

              {/* Items */}
              <div>
                <Label className="text-muted-warm text-xs">Items</Label>
                <div className="space-y-1.5 mt-2">
                  {editOrder.items?.map((item, j) => (
                    <div key={j} className="flex items-center justify-between bg-offwhite rounded-lg px-3 py-2">
                      <div className="flex items-center gap-2">
                        {item.image_url && (
                          <img src={item.image_url} alt="" className="w-8 h-8 object-contain rounded" />
                        )}
                        <div>
                          <p className="text-[10px] text-accent-orange font-semibold uppercase tracking-wider">
                            {item.watch_brand}
                          </p>
                          <p className="text-xs text-warm-black">{item.watch_name}</p>
                        </div>
                      </div>
                      <p className="text-xs text-warm-black font-medium">${item.price?.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div>
                <Label className="text-muted-warm text-xs">Total</Label>
                <p className="text-lg font-semibold text-warm-black mt-1">${editOrder.total?.toLocaleString()}</p>
              </div>

              {/* Status */}
              <div>
                <Label className="text-muted-warm text-xs">Status</Label>
                <Select value={editStatus} onValueChange={setEditStatus}>
                  <SelectTrigger className="w-full border-warm-border text-warm-black text-sm mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-warm-border">
                    {ALL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s} className="text-warm-black focus:bg-offwhite text-sm capitalize">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Date */}
              <div>
                <Label className="text-muted-warm text-xs">Created</Label>
                <p className="text-sm text-warm-black mt-1">
                  {editOrder.created_date
                    ? new Date(editOrder.created_date).toLocaleString()
                    : "—"}
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  className="flex-1 border-warm-border text-warm-black hover:bg-offwhite"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending || editStatus === editOrder.status}
                  className="flex-1 bg-accent-orange text-white hover:bg-accent-orange/90"
                >
                  {updateMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
