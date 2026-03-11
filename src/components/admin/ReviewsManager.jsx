import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Trash2, Copy, Star, Eye, Check, X, Pencil, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  fetchAdminReviews,
  deleteReview,
  approveReview,
  rejectReview,
  editReview,
} from "@/services/reviews";

const STATUS_TABS = [
  { key: "submitted", label: "Awaiting Approval" },
  { key: "pending", label: "Pending Response" },
  { key: "active", label: "Active on Site" },
  { key: "inactive", label: "Rejected" },
];

export default function ReviewsManager() {
  const [activeFilter, setActiveFilter] = useState("submitted");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);
  const [editForm, setEditForm] = useState({ rating: 0, testimonial: "", customer_name: "" });

  const queryClient = useQueryClient();

  const { data: allReviews = [] } = useQuery({
    queryKey: ["admin-reviews"],
    queryFn: fetchAdminReviews,
  });

  const reviews = allReviews.filter((r) => r.status === activeFilter);

  const approveMutation = useMutation({
    mutationFn: (id) => approveReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review activated — now visible on the website");
    },
    onError: (err) => toast.error(err.message),
  });

  const rejectMutation = useMutation({
    mutationFn: (id) => rejectReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review rejected");
    },
    onError: (err) => toast.error(err.message),
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }) => editReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review updated");
      setShowEditDialog(false);
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Review deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const handleCopyLink = (reviewId) => {
    const url = `${window.location.origin}/review?token=${reviewId}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  const handleEdit = (review) => {
    setSelectedReview(review);
    setEditForm({
      rating: review.rating || 0,
      testimonial: review.testimonial || "",
      customer_name: review.customer_name || "",
    });
    setShowEditDialog(true);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    editMutation.mutate({
      id: selectedReview.id,
      data: editForm,
    });
  };

  const handleView = (review) => {
    setSelectedReview(review);
    setShowViewDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm("Delete this review permanently?")) {
      deleteMutation.mutate(id);
    }
  };

  // Count per status
  const counts = {};
  for (const tab of STATUS_TABS) {
    counts[tab.key] = allReviews.filter((r) => r.status === tab.key).length;
  }

  return (
    <div>
      {/* Status filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-8">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`px-3 py-1.5 text-xs font-semibold tracking-wider uppercase rounded-md transition-colors ${
              activeFilter === tab.key
                ? "bg-warm-black text-white"
                : "text-muted-warm hover:text-warm-black bg-white border border-warm-border"
            }`}
          >
            {tab.label}
            {counts[tab.key] > 0 && (
              <span className={`ml-1.5 ${activeFilter === tab.key ? "text-white/70" : "text-muted-warm"}`}>
                ({counts[tab.key]})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {reviews.length === 0 ? (
        <div className="bg-white border border-warm-border rounded-xl p-12 text-center">
          <p className="text-muted-warm">
            {activeFilter === "submitted"
              ? "No reviews awaiting approval."
              : activeFilter === "pending"
              ? "No pending review requests."
              : activeFilter === "active"
              ? "No active reviews on the website yet."
              : "No rejected reviews."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-warm-border rounded-xl p-5"
            >
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium text-warm-black">
                      {review.customer_name || "—"}
                    </p>
                    <span className="text-[10px] text-muted-warm">{review.customer_email}</span>
                  </div>

                  {review.product_name && (
                    <p className="text-[10px] text-accent-orange font-semibold uppercase tracking-wider mb-2">
                      {review.product_brand} {review.product_name}
                    </p>
                  )}

                  {review.rating && (
                    <div className="flex items-center gap-0.5 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < review.rating
                              ? "fill-amber-gold text-amber-gold"
                              : "fill-none text-warm-border"
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {review.testimonial && (
                    <p className="text-sm text-warm-black font-light leading-relaxed line-clamp-2">
                      "{review.testimonial}"
                    </p>
                  )}

                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-warm">
                    {review.purchase_date && <span>Purchased {review.purchase_date}</span>}
                    <span>Created {new Date(review.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0 flex-wrap">
                  {/* Submitted: edit, approve, reject */}
                  {activeFilter === "submitted" && (
                    <>
                      <Button
                        onClick={() => handleEdit(review)}
                        variant="outline"
                        size="sm"
                        className="border-warm-border text-warm-black hover:bg-offwhite gap-1.5 text-xs"
                      >
                        <Pencil className="w-3 h-3" /> Edit
                      </Button>
                      <Button
                        onClick={() => approveMutation.mutate(review.id)}
                        size="sm"
                        className="bg-accent-orange text-white hover:bg-accent-orange/90 gap-1.5 text-xs"
                      >
                        <Check className="w-3 h-3" /> Approve
                      </Button>
                      <Button
                        onClick={() => rejectMutation.mutate(review.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-500 hover:bg-red-50 gap-1.5 text-xs"
                      >
                        <Ban className="w-3 h-3" /> Reject
                      </Button>
                    </>
                  )}

                  {/* Pending: copy link */}
                  {activeFilter === "pending" && (
                    <Button
                      onClick={() => handleCopyLink(review.id)}
                      variant="outline"
                      size="sm"
                      className="border-warm-border text-warm-black hover:bg-offwhite gap-1.5 text-xs"
                    >
                      <Copy className="w-3 h-3" /> Copy Link
                    </Button>
                  )}

                  {/* Active: view, deactivate */}
                  {activeFilter === "active" && (
                    <>
                      <Button
                        onClick={() => handleView(review)}
                        variant="outline"
                        size="sm"
                        className="border-warm-border text-warm-black hover:bg-offwhite gap-1.5 text-xs"
                      >
                        <Eye className="w-3 h-3" /> View
                      </Button>
                      <Button
                        onClick={() => rejectMutation.mutate(review.id)}
                        variant="outline"
                        size="sm"
                        className="border-red-200 text-red-500 hover:bg-red-50 gap-1.5 text-xs"
                      >
                        <X className="w-3 h-3" /> Deactivate
                      </Button>
                    </>
                  )}

                  {/* Inactive: reactivate */}
                  {activeFilter === "inactive" && (
                    <Button
                      onClick={() => approveMutation.mutate(review.id)}
                      size="sm"
                      className="bg-accent-orange text-white hover:bg-accent-orange/90 gap-1.5 text-xs"
                    >
                      <Check className="w-3 h-3" /> Reactivate
                    </Button>
                  )}

                  {/* Delete always available */}
                  <Button
                    onClick={() => handleDelete(review.id)}
                    variant="outline"
                    size="sm"
                    className="border-red-200 text-red-500 hover:bg-red-50 px-2"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-white border-warm-border text-warm-black max-w-md">
          <DialogHeader>
            <DialogTitle className="text-warm-black">Edit Review</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <form onSubmit={handleEditSubmit} className="space-y-4 mt-4">
              <div>
                <Label className="text-muted-warm text-xs">Customer Name</Label>
                <Input
                  value={editForm.customer_name}
                  onChange={(e) => setEditForm({ ...editForm, customer_name: e.target.value })}
                  className="border-warm-border text-warm-black mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-warm text-xs">Rating</Label>
                <div className="flex items-center gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setEditForm({ ...editForm, rating: star })}
                      className="p-0.5"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= editForm.rating
                            ? "fill-amber-gold text-amber-gold"
                            : "fill-none text-warm-border"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-muted-warm text-xs">Testimonial</Label>
                <Textarea
                  value={editForm.testimonial}
                  onChange={(e) => setEditForm({ ...editForm, testimonial: e.target.value })}
                  className="border-warm-border text-warm-black mt-1 min-h-[120px]"
                  maxLength={2000}
                />
              </div>
              <div className="flex gap-3 pt-2">
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
                  disabled={editMutation.isPending}
                  className="flex-1 bg-accent-orange text-white hover:bg-accent-orange/90"
                >
                  {editMutation.isPending ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="bg-white border-warm-border text-warm-black max-w-md">
          <DialogHeader>
            <DialogTitle className="text-warm-black">Review Details</DialogTitle>
          </DialogHeader>
          {selectedReview && (
            <div className="space-y-4 mt-4">
              <div>
                <p className="text-[10px] text-muted-warm uppercase tracking-wider">Customer</p>
                <p className="text-sm text-warm-black font-medium">{selectedReview.customer_name}</p>
                <p className="text-xs text-muted-warm">{selectedReview.customer_email}</p>
              </div>
              {selectedReview.product_name && (
                <div>
                  <p className="text-[10px] text-muted-warm uppercase tracking-wider">Watch</p>
                  <p className="text-sm text-accent-orange font-semibold">
                    {selectedReview.product_brand} {selectedReview.product_name}
                  </p>
                </div>
              )}
              <div>
                <p className="text-[10px] text-muted-warm uppercase tracking-wider">Rating</p>
                <div className="flex items-center gap-0.5 mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < selectedReview.rating
                          ? "fill-amber-gold text-amber-gold"
                          : "fill-none text-warm-border"
                      }`}
                    />
                  ))}
                </div>
              </div>
              <div>
                <p className="text-[10px] text-muted-warm uppercase tracking-wider">Testimonial</p>
                <p className="text-sm text-warm-black mt-1 leading-relaxed">
                  {selectedReview.testimonial}
                </p>
              </div>
              {selectedReview.purchase_date && (
                <div>
                  <p className="text-[10px] text-muted-warm uppercase tracking-wider">Purchase Date</p>
                  <p className="text-sm text-warm-black">{selectedReview.purchase_date}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
