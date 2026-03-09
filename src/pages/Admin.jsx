import React, { useState, useEffect } from "react";
import { base44 } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Upload, X } from "lucide-react";
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
  description: "",
  image_url: "",
  gallery_urls: [],
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
    description: watch.description || "",
    image_url: imgs[0] || "",
    gallery_urls: imgs.slice(1),
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
    videos: [],
  };
}

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingWatch, setEditingWatch] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
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
      <div className="bg-background min-h-screen pt-24 flex items-center justify-center">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-background min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl text-foreground font-light tracking-tight">Admin Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Manage watch inventory</p>
          </div>
          <Button
            onClick={() => setShowDialog(true)}
            className="bg-gold text-primary-foreground hover:bg-gold-light gap-2"
          >
            <Plus className="w-4 h-4" /> Add Watch
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watches.map((watch) => (
            <motion.div
              key={watch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/50 rounded-sm overflow-hidden"
            >
              <div className="aspect-square bg-[#1A1A1A]">
                <img
                  src={watch.image_url || "/assets/watches/1-rolex-submariner.jpg"}
                  alt={watch.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-gold text-[10px] tracking-[0.2em] uppercase">{watch.brand}</p>
                <h3 className="text-foreground text-sm font-light mt-1 truncate">{watch.name}</h3>
                <p className="text-white/60 text-sm mt-2">${watch.price?.toLocaleString()}</p>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() => handleEdit(watch)}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2"
                  >
                    <Pencil className="w-3 h-3" /> Edit
                  </Button>
                  <Button
                    onClick={() => handleDelete(watch.id)}
                    variant="outline"
                    size="sm"
                    className="flex-1 bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 gap-2"
                  >
                    <Trash2 className="w-3 h-3" /> Delete
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <Dialog open={showDialog} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="bg-card border-border/50 text-foreground max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                {editingWatch ? "Edit Watch" : "Add New Watch"}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60 text-xs">Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    required
                  />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Brand</Label>
                  <Select value={formData.brand} onValueChange={(v) => setFormData({ ...formData, brand: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10">
                      {BRANDS.map((b) => (
                        <SelectItem key={b} value={b} className="text-white focus:bg-white/10">
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-white/60 text-xs">Price ($)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                  required
                />
              </div>

              <div>
                <Label className="text-white/60 text-xs">Main Image</Label>
                <div className="mt-1 space-y-2">
                  {formData.image_url && (
                    <div className="relative w-32 h-32 bg-[#1A1A1A] rounded-sm overflow-hidden">
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
                  <label className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors w-fit text-sm">
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : "Upload Main Image"}
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-white/60 text-xs">Gallery Images</Label>
                <div className="mt-1 space-y-2">
                  {formData.gallery_urls.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.gallery_urls.map((url, index) => (
                        <div key={index} className="relative w-24 h-24 bg-[#1A1A1A] rounded-sm overflow-hidden">
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
                  <label className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors w-fit text-sm">
                    <Upload className="w-4 h-4" />
                    {uploadingImage ? "Uploading..." : "Upload Gallery Images"}
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" disabled={uploadingImage} />
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-white/60 text-xs">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1 h-24"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-white/60 text-xs">Category</Label>
                  <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10">
                      {CATEGORIES.map((c) => (
                        <SelectItem key={c} value={c} className="text-white focus:bg-white/10">
                          {c.replace(/_/g, " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Movement</Label>
                  <Select value={formData.movement} onValueChange={(v) => setFormData({ ...formData, movement: v })}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1A1A1A] border-white/10">
                      {MOVEMENTS.map((m) => (
                        <SelectItem key={m} value={m} className="text-white focus:bg-white/10">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Case Diameter</Label>
                  <Input
                    value={formData.case_diameter}
                    onChange={(e) => setFormData({ ...formData, case_diameter: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                    placeholder="42mm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/60 text-xs">Case Material</Label>
                  <Input
                    value={formData.case_material}
                    onChange={(e) => setFormData({ ...formData, case_material: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
                <div>
                  <Label className="text-white/60 text-xs">Water Resistance</Label>
                  <Input
                    value={formData.water_resistance}
                    onChange={(e) => setFormData({ ...formData, water_resistance: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
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
                <span className="text-white/60 text-xs">In Stock</span>
              </label>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1 bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1 bg-gold text-primary-foreground hover:bg-gold-light"
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
