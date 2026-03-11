import React, { useState, useEffect } from "react";
import { base44 } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Upload, X, Film, MessageSquare, ShoppingBag } from "lucide-react";
import ReviewsManager from "@/components/admin/ReviewsManager";
import OrdersManager from "@/components/admin/OrdersManager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { toast } from "sonner";

const BRANDS = ["Rolex", "Audemars Piguet", "Patek Philippe", "Omega", "Tag Heuer", "Cartier", "Breitling"];
const CATEGORIES = ["new_arrival", "sale", "bestseller", "limited_edition", "all"];
const MOVEMENTS = ["Automatic", "Quartz", "Manual"];

const ADMIN_EMAILS = [
  "admin112874@chronoluxe.com",
  "uberuhanunal@gmail.com",
  "templateseverlasting@gmail.com",
  "santis.watches.managment@gmail.com",
];

const emptyForm = () => ({
  name: "",
  brand: BRANDS[0],
  price: "",
  original_price: "",
  description: "",
  image_url: "",
  gallery_urls: [],
  video_urls: [],
  category: "new_arrival",
  movement: "Automatic",
  case_material: "",
  water_resistance: "",
  case_diameter: "",
  in_stock: true,
});

// Map D1 row → form fields
function watchToForm(watch) {
  const imgs = watch.images || [];
  return {
    name: watch.name || "",
    brand: watch.brand || BRANDS[0],
    price: watch.price?.toString() || "",
    original_price: watch.original_price?.toString() || "",
    description: watch.description || "",
    image_url: imgs[0] || "",
    gallery_urls: imgs.slice(1),
    video_urls: watch.videos || [],
    category: watch.category || "new_arrival",
    movement: watch.specs?.movement || "Automatic",
    case_material: watch.material || "",
    water_resistance: watch.specs?.water_resistance || "",
    case_diameter: watch.specs?.case_size || "",
    in_stock: (watch.stock ?? 1) > 0,
  };
}

// Map form fields → D1 payload
function formToWatch(formData) {
  const images = formData.image_url
    ? [formData.image_url, ...formData.gallery_urls]
    : [...formData.gallery_urls];
  return {
    name: formData.name,
    brand: formData.brand,
    price: parseFloat(formData.price),
    original_price: formData.original_price ? parseFloat(formData.original_price) : null,
    description: formData.description,
    images,
    material: formData.case_material,
    category: formData.category,
    stock: formData.in_stock ? 1 : 0,
    specs: {
      movement: formData.movement,
      water_resistance: formData.water_resistance,
      case_size: formData.case_diameter,
    },
    tags: [],
    videos: formData.video_urls,
  };
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("watches");
  const [showDialog, setShowDialog] = useState(false);
  const [editingWatch, setEditingWatch] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState(0);
  const [formData, setFormData] = useState(emptyForm());

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        if (!currentUser) {
          base44.auth.redirectToLogin("/admin");
          return;
        }
        const isAuthorized = currentUser.role === "admin" || ADMIN_EMAILS.includes(currentUser.email);
        if (!isAuthorized) {
          window.location.href = "/";
          return;
        }
        setUser(currentUser);
      } catch (error) {
        base44.auth.redirectToLogin("/admin");
      } finally {
        setIsLoading(false);
      }
    };
    checkAdmin();
  }, []);

  const { data: watches = [] } = useQuery({
    queryKey: ["admin-watches"],
    queryFn: () => base44.entities.Watch.list(),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Watch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
      toast.success("Watch created successfully");
      resetForm();
    },
    onError: (err) => toast.error(err.message || "Failed to create watch"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Watch.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
      toast.success("Watch updated successfully");
      resetForm();
    },
    onError: (err) => toast.error(err.message || "Failed to update watch"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Watch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
      toast.success("Watch deleted");
    },
    onError: (err) => toast.error(err.message || "Failed to delete watch"),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData((f) => ({ ...f, image_url: file_url }));
      toast.success("Image uploaded");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingImage(true);
    try {
      const results = await Promise.all(files.map((f) => base44.integrations.Core.UploadFile({ file: f })));
      const newUrls = results.map((r) => r.file_url);
      setFormData((f) => ({ ...f, gallery_urls: [...f.gallery_urls, ...newUrls] }));
      toast.success(`${files.length} image(s) uploaded`);
    } catch {
      toast.error("Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeGalleryImage = (index) => {
    setFormData((f) => {
      const updated = [...f.gallery_urls];
      updated.splice(index, 1);
      return { ...f, gallery_urls: updated };
    });
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploadingVideo(true);
    setVideoUploadProgress(0);
    try {
      for (let i = 0; i < files.length; i++) {
        const { file_url } = await base44.integrations.Core.UploadFileWithProgress({
          file: files[i],
          onProgress: (pct) => setVideoUploadProgress(Math.round((i / files.length) * 100 + pct / files.length)),
        });
        setFormData((f) => ({ ...f, video_urls: [...f.video_urls, file_url] }));
      }
      toast.success(`${files.length} video(s) uploaded`);
    } catch {
      toast.error("Failed to upload video");
    } finally {
      setUploadingVideo(false);
      setVideoUploadProgress(0);
      e.target.value = "";
    }
  };

  const removeVideo = (index) => {
    setFormData((f) => {
      const updated = [...f.video_urls];
      updated.splice(index, 1);
      return { ...f, video_urls: updated };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = formToWatch(formData);
    if (editingWatch) {
      updateMutation.mutate({ id: editingWatch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (watch) => {
    setEditingWatch(watch);
    setFormData(watchToForm(watch));
    setShowDialog(true);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this watch?")) {
      deleteMutation.mutate(id);
    }
  };

  const resetForm = () => {
    setShowDialog(false);
    setEditingWatch(null);
    setFormData(emptyForm());
  };

  if (isLoading) {
    return (
      <div className="bg-offwhite min-h-screen pt-24 flex items-center justify-center">
        <div className="text-muted-warm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-offwhite min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl text-warm-black font-light tracking-tight">Admin Dashboard</h1>
          </div>
          {activeTab === "watches" && (
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-accent-orange text-white hover:bg-accent-orange/90 gap-2"
            >
              <Plus className="w-4 h-4" /> Add Watch
            </Button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mb-8 bg-white border border-warm-border rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab("watches")}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-colors ${
              activeTab === "watches"
                ? "bg-warm-black text-white"
                : "text-muted-warm hover:text-warm-black"
            }`}
          >
            Watches
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "orders"
                ? "bg-warm-black text-white"
                : "text-muted-warm hover:text-warm-black"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" /> Orders
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === "reviews"
                ? "bg-warm-black text-white"
                : "text-muted-warm hover:text-warm-black"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" /> Reviews
          </button>
        </div>

        {/* Orders Tab */}
        {activeTab === "orders" && <OrdersManager />}

        {/* Reviews Tab */}
        {activeTab === "reviews" && <ReviewsManager />}

        {/* Watches Tab */}
        {activeTab === "watches" && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watches.map((watch) => (
            <motion.div
              key={watch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-warm-border rounded-xl overflow-hidden"
            >
              <div className="aspect-square bg-offwhite flex items-center justify-center p-4">
                <img
                  src={watch.images?.[0] || watch.image_url || "/assets/watches/panda_daytona-removebg-preview.png"}
                  alt={watch.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-4">
                <p className="text-accent-orange text-[10px] tracking-[0.2em] uppercase font-semibold">{watch.brand}</p>
                <h3 className="text-warm-black text-sm font-medium mt-1 truncate">{watch.name}</h3>
                <p className="text-muted-warm text-sm mt-1">${watch.price?.toLocaleString()}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleEdit(watch)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-warm-border text-warm-black hover:bg-offwhite gap-2"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(watch.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 border-red-200 text-red-500 hover:bg-red-50 gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>}

        <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="bg-white border-warm-border text-warm-black max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-warm-black">
                {editingWatch ? "Edit Watch" : "Add New Watch"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-warm text-xs">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-warm-border text-warm-black mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-muted-warm text-xs">Brand</Label>
                  <Select value={formData.brand} onValueChange={(v) => setFormData({ ...formData, brand: v })}>
                    <SelectTrigger className="border-warm-border text-warm-black mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-warm-border">
                      {BRANDS.map((b) => (
                        <SelectItem key={b} value={b} className="text-warm-black focus:bg-offwhite">
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-warm text-xs">Sale Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="border-warm-border text-warm-black mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-muted-warm text-xs">Original Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="border-warm-border text-warm-black mt-1"
                    placeholder="Leave empty if no discount"
                  />
                  {formData.original_price && formData.price && parseFloat(formData.original_price) > parseFloat(formData.price) && (
                    <p className="text-accent-orange text-[10px] mt-1 font-semibold">
                      {Math.round(((parseFloat(formData.original_price) - parseFloat(formData.price)) / parseFloat(formData.original_price)) * 100)}% discount
                    </p>
                  )}
                </div>
              </div>

              <div>
                <Label className="text-muted-warm text-xs">Main Image</Label>
                <div className="mt-1 space-y-2">
                  {formData.image_url && (
                    <div className="relative w-32 h-32 bg-offwhite rounded-lg overflow-hidden border border-warm-border">
                      <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, image_url: "" })}
                        className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <label className="flex items-center gap-2 border border-warm-border text-muted-warm px-4 py-2 cursor-pointer hover:bg-offwhite transition-colors w-fit text-sm rounded-lg">
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : "Upload Main Image"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-muted-warm text-xs">Gallery Images</Label>
                <div className="mt-1 space-y-2">
                  {formData.gallery_urls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.gallery_urls.map((url, index) => (
                        <div key={index} className="relative w-24 h-24 bg-offwhite rounded-lg overflow-hidden border border-warm-border">
                          <img src={url} alt={`Gallery ${index + 1}`} className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <label className="flex items-center gap-2 border border-warm-border text-muted-warm px-4 py-2 cursor-pointer hover:bg-offwhite transition-colors w-fit text-sm rounded-lg">
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : "Upload Gallery Images"}
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-muted-warm text-xs">Videos</Label>
                <div className="mt-1 space-y-2">
                  {formData.video_urls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.video_urls.map((url, index) => (
                        <div key={index} className="relative w-32 h-24 bg-offwhite rounded-lg overflow-hidden border border-warm-border">
                          <video src={url} muted playsInline className="w-full h-full object-cover" />
                          <div className="absolute bottom-1 left-1">
                            <Film className="w-3.5 h-3.5 text-white drop-shadow-md" />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeVideo(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {uploadingVideo && (
                    <div className="w-full bg-warm-border rounded-full h-1.5">
                      <div
                        className="bg-amber-gold h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${videoUploadProgress}%` }}
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2 border border-warm-border text-muted-warm px-4 py-2 cursor-pointer hover:bg-offwhite transition-colors w-fit text-sm rounded-lg">
                    <Film className="w-4 h-4" />
                    {uploadingVideo ? `Uploading... ${videoUploadProgress}%` : "Upload Videos"}
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov"
                      multiple
                      onChange={handleVideoUpload}
                      className="hidden"
                      disabled={uploadingVideo}
                    />
                  </label>
                  <p className="text-muted-warm text-[10px]">MP4, WebM, or MOV up to 100MB</p>
                </div>
              </div>

              <div>
                <Label className="text-muted-warm text-xs">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="border-warm-border text-warm-black mt-1 h-24"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-muted-warm text-xs">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="border-warm-border text-warm-black mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-warm-border">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-warm-black focus:bg-offwhite">
                          {c.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-warm text-xs">Movement</Label>
                  <Select value={formData.movement} onValueChange={(v) => setFormData({ ...formData, movement: v })}>
                    <SelectTrigger className="border-warm-border text-warm-black mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-warm-border">
                      {MOVEMENTS.map((m) => (
                        <SelectItem key={m} value={m} className="text-warm-black focus:bg-offwhite">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-muted-warm text-xs">Case Diameter</Label>
                  <Input
                    value={formData.case_diameter}
                    onChange={(e) => setFormData({ ...formData, case_diameter: e.target.value })}
                    className="border-warm-border text-warm-black mt-1"
                    placeholder="42mm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-warm text-xs">Case Material</Label>
                  <Input
                    value={formData.case_material}
                    onChange={(e) => setFormData({ ...formData, case_material: e.target.value })}
                    className="border-warm-border text-warm-black mt-1"
                  />
                </div>
                <div>
                  <Label className="text-muted-warm text-xs">Water Resistance</Label>
                  <Input
                    value={formData.water_resistance}
                    onChange={(e) => setFormData({ ...formData, water_resistance: e.target.value })}
                    className="border-warm-border text-warm-black mt-1"
                    placeholder="100m"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.in_stock}
                  onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-muted-warm text-xs">In Stock</span>
              </label>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 border-warm-border text-warm-black hover:bg-offwhite"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-accent-orange text-white hover:bg-accent-orange/90"
                >
                  {editingWatch ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
