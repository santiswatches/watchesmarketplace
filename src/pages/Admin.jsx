import React, { useState, useEffect } from "react";
import { base44 } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2, Upload, X, Tag } from "lucide-react";
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

const CATEGORIES = ["new_arrival", "sale", "bestseller", "limited_edition"];
const MOVEMENTS = ["Automatic", "Quartz", "Manual"];

export default function Admin() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showBrandDialog, setShowBrandDialog] = useState(false);
  const [editingWatch, setEditingWatch] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [newBrandName, setNewBrandName] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    brand: "Rolex",
    price: "",
    original_price: "",
    description: "",
    short_description: "",
    image_url: "",
    gallery_urls: [],
    variants: [],
    category: "new_arrival",
    movement: "Automatic",
    case_material: "",
    water_resistance: "",
    case_diameter: "",
    in_stock: true,
    featured: false,
  });
  const [newVariant, setNewVariant] = useState({
    name: "",
    price: "",
    original_price: "",
    description: "",
    case_material: "",
    gallery_urls: [],
  });

  const queryClient = useQueryClient();

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const currentUser = await base44.auth.me();
        // Allow access for admin role OR specific admin emails
        const adminEmails = ["admin112874@chronoluxe.com", "uberuhanunal@gmail.com", "templateseverlasting@gmail.com"];
        const isAuthorized = currentUser.role === "admin" || adminEmails.includes(currentUser.email);
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
    queryFn: () => base44.entities.Watch.list("-created_date", 200),
    enabled: !!user,
  });

  const { data: brands = [] } = useQuery({
    queryKey: ["admin-brands"],
    queryFn: () => base44.entities.Brand.list("-created_date", 100),
    enabled: !!user,
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Watch.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
      toast.success("Watch created successfully");
      resetForm();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Watch.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
      toast.success("Watch updated successfully");
      resetForm();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Watch.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-watches"] });
      toast.success("Watch deleted successfully");
    },
  });

  const createBrandMutation = useMutation({
    mutationFn: (data) => base44.entities.Brand.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand added successfully");
      setShowBrandDialog(false);
      setNewBrandName("");
    },
  });

  const deleteBrandMutation = useMutation({
    mutationFn: (id) => base44.entities.Brand.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-brands"] });
      toast.success("Brand deleted successfully");
    },
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setFormData({ ...formData, image_url: file_url });
      toast.success("Image uploaded");
    } catch (error) {
      toast.error("Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      setFormData({ 
        ...formData, 
        gallery_urls: [...(formData.gallery_urls || []), ...newUrls] 
      });
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeGalleryImage = (index) => {
    const updated = [...(formData.gallery_urls || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, gallery_urls: updated });
  };

  const handleVariantGalleryUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploadingImage(true);
    try {
      const uploadPromises = files.map(file => 
        base44.integrations.Core.UploadFile({ file })
      );
      const results = await Promise.all(uploadPromises);
      const newUrls = results.map(r => r.file_url);
      setNewVariant({ 
        ...newVariant, 
        gallery_urls: [...(newVariant.gallery_urls || []), ...newUrls] 
      });
      toast.success(`${files.length} image(s) uploaded`);
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setUploadingImage(false);
    }
  };

  const removeVariantGalleryImage = (index) => {
    const updated = [...(newVariant.gallery_urls || [])];
    updated.splice(index, 1);
    setNewVariant({ ...newVariant, gallery_urls: updated });
  };

  const addVariant = () => {
    if (!newVariant.name || !newVariant.price) {
      toast.error("Variant name and price are required");
      return;
    }
    const variant = {
      ...newVariant,
      price: parseFloat(newVariant.price),
      original_price: newVariant.original_price ? parseFloat(newVariant.original_price) : undefined,
    };
    setFormData({ ...formData, variants: [...(formData.variants || []), variant] });
    setNewVariant({
      name: "",
      price: "",
      original_price: "",
      description: "",
      case_material: "",
      gallery_urls: [],
    });
    toast.success("Variant added");
  };

  const removeVariant = (index) => {
    const updated = [...(formData.variants || [])];
    updated.splice(index, 1);
    setFormData({ ...formData, variants: updated });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      ...formData,
      price: parseFloat(formData.price),
      original_price: formData.original_price ? parseFloat(formData.original_price) : undefined,
    };

    if (editingWatch) {
      updateMutation.mutate({ id: editingWatch.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (watch) => {
    setEditingWatch(watch);
    setFormData({
      name: watch.name || "",
      brand: watch.brand || "Rolex",
      price: watch.price?.toString() || "",
      original_price: watch.original_price?.toString() || "",
      description: watch.description || "",
      short_description: watch.short_description || "",
      image_url: watch.image_url || "",
      gallery_urls: watch.gallery_urls || [],
      variants: watch.variants || [],
      category: watch.category || "new_arrival",
      movement: watch.movement || "Automatic",
      case_material: watch.case_material || "",
      water_resistance: watch.water_resistance || "",
      case_diameter: watch.case_diameter || "",
      in_stock: watch.in_stock ?? true,
      featured: watch.featured ?? false,
    });
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
    setFormData({
      name: "",
      brand: brands.length > 0 ? brands[0].name : "",
      price: "",
      original_price: "",
      description: "",
      short_description: "",
      image_url: "",
      gallery_urls: [],
      variants: [],
      category: "new_arrival",
      movement: "Automatic",
      case_material: "",
      water_resistance: "",
      case_diameter: "",
      in_stock: true,
      featured: false,
    });
  };

  const handleAddBrand = (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return;
    createBrandMutation.mutate({ name: newBrandName.trim() });
  };

  const handleDeleteBrand = (id) => {
    if (confirm("Are you sure you want to delete this brand?")) {
      deleteBrandMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-[#0A0A0A] min-h-screen pt-24 flex items-center justify-center">
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="bg-[#0A0A0A] min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl text-white font-light tracking-tight">Admin Dashboard</h1>
            <p className="text-white/40 text-sm mt-1">Manage watch inventory and brands</p>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={() => setShowBrandDialog(true)}
              variant="outline"
              className="bg-white/5 border-white/10 text-white hover:bg-white/10 gap-2"
            >
              <Tag className="w-4 h-4" /> Manage Brands
            </Button>
            <Button
              onClick={() => setShowDialog(true)}
              className="bg-[#C9A962] text-[#0A0A0A] hover:bg-[#D4B870] gap-2"
            >
              <Plus className="w-4 h-4" /> Add Watch
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {watches.map((watch) => (
            <motion.div
              key={watch.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#111] border border-white/10 rounded-sm overflow-hidden"
            >
              <div className="aspect-square bg-[#1A1A1A]">
                <img
                  src={watch.image_url || "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400&q=80"}
                  alt={watch.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-4">
                <p className="text-[#C9A962] text-[10px] tracking-[0.2em] uppercase">{watch.brand}</p>
                <h3 className="text-white text-sm font-light mt-1 truncate">{watch.name}</h3>
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
          <DialogContent className="bg-[#111] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
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
                      {brands.map((b) => (
                        <SelectItem key={b.id} value={b.name} className="text-white focus:bg-white/10">
                          {b.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
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
                  <Label className="text-white/60 text-xs">Original Price ($)</Label>
                  <Input
                    type="number"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="bg-white/5 border-white/10 text-white mt-1"
                  />
                </div>
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
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-white/60 text-xs">Gallery Images</Label>
                <div className="mt-1 space-y-2">
                  {formData.gallery_urls && formData.gallery_urls.length > 0 && (
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
                    <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div>
                <Label className="text-white/60 text-xs">Short Description</Label>
                <Input
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="bg-white/5 border-white/10 text-white mt-1"
                />
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
                          {c.replace("_", " ")}
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

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white/60 text-xs">In Stock</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <span className="text-white/60 text-xs">Featured</span>
                </label>
              </div>

              {/* Variants Section */}
              <div className="border-t border-white/10 pt-6 mt-6">
                <Label className="text-white text-sm mb-4 block">Variants (Colors/Options)</Label>
                
                {/* Existing Variants */}
                {formData.variants && formData.variants.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {formData.variants.map((variant, index) => (
                      <div key={index} className="bg-white/5 border border-white/10 rounded-sm p-3 flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">{variant.name}</p>
                          <p className="text-white/40 text-xs">${variant.price}</p>
                        </div>
                        <Button
                          type="button"
                          onClick={() => removeVariant(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add New Variant */}
                <div className="bg-white/5 border border-white/10 rounded-sm p-4 space-y-3">
                  <p className="text-white/60 text-xs mb-2">Add New Variant</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/40 text-[10px]">Name</Label>
                      <Input
                        value={newVariant.name}
                        onChange={(e) => setNewVariant({ ...newVariant, name: e.target.value })}
                        className="bg-white/5 border-white/10 text-white mt-1 text-sm h-8"
                        placeholder="Black"
                      />
                    </div>
                    <div>
                      <Label className="text-white/40 text-[10px]">Price ($)</Label>
                      <Input
                        type="number"
                        value={newVariant.price}
                        onChange={(e) => setNewVariant({ ...newVariant, price: e.target.value })}
                        className="bg-white/5 border-white/10 text-white mt-1 text-sm h-8"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-white/40 text-[10px]">Original Price ($)</Label>
                      <Input
                        type="number"
                        value={newVariant.original_price}
                        onChange={(e) => setNewVariant({ ...newVariant, original_price: e.target.value })}
                        className="bg-white/5 border-white/10 text-white mt-1 text-sm h-8"
                      />
                    </div>
                    <div>
                      <Label className="text-white/40 text-[10px]">Case Material</Label>
                      <Input
                        value={newVariant.case_material}
                        onChange={(e) => setNewVariant({ ...newVariant, case_material: e.target.value })}
                        className="bg-white/5 border-white/10 text-white mt-1 text-sm h-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-white/40 text-[10px]">Description</Label>
                    <Textarea
                      value={newVariant.description}
                      onChange={(e) => setNewVariant({ ...newVariant, description: e.target.value })}
                      className="bg-white/5 border-white/10 text-white mt-1 text-sm h-16"
                    />
                  </div>
                  <div>
                    <Label className="text-white/40 text-[10px]">Variant Images</Label>
                    {newVariant.gallery_urls && newVariant.gallery_urls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-1 mb-2">
                        {newVariant.gallery_urls.map((url, idx) => (
                          <div key={idx} className="relative w-16 h-16 bg-[#1A1A1A] rounded-sm overflow-hidden">
                            <img src={url} alt={`Variant ${idx + 1}`} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeVariantGalleryImage(idx)}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white p-0.5 rounded-full"
                            >
                              <X className="w-2 h-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    <label className="flex items-center gap-2 bg-white/5 border border-white/10 text-white/60 px-3 py-1.5 cursor-pointer hover:bg-white/10 transition-colors w-fit text-xs">
                      <Upload className="w-3 h-3" />
                      Upload Images
                      <input type="file" accept="image/*" multiple onChange={handleVariantGalleryUpload} className="hidden" />
                    </label>
                  </div>
                  <Button
                    type="button"
                    onClick={addVariant}
                    className="w-full bg-[#C9A962] text-[#0A0A0A] hover:bg-[#D4B870] h-8 text-xs"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add This Variant
                  </Button>
                </div>
              </div>

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
                  className="flex-1 bg-[#C9A962] text-[#0A0A0A] hover:bg-[#D4B870]"
                >
                  {editingWatch ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={showBrandDialog} onOpenChange={setShowBrandDialog}>
          <DialogContent className="bg-[#111] border-white/10 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Manage Brands</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleAddBrand} className="space-y-4 mt-4">
              <div className="flex gap-2">
                <Input
                  value={newBrandName}
                  onChange={(e) => setNewBrandName(e.target.value)}
                  placeholder="Enter brand name"
                  className="bg-white/5 border-white/10 text-white flex-1"
                />
                <Button
                  type="submit"
                  disabled={createBrandMutation.isPending}
                  className="bg-[#C9A962] text-[#0A0A0A] hover:bg-[#D4B870]"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </form>

            <div className="space-y-2 mt-6 max-h-64 overflow-y-auto">
              {brands.length === 0 ? (
                <p className="text-white/40 text-sm text-center py-4">No brands yet</p>
              ) : (
                brands.map((brand) => (
                  <div
                    key={brand.id}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-sm px-3 py-2"
                  >
                    <span className="text-white text-sm">{brand.name}</span>
                    <Button
                      onClick={() => handleDeleteBrand(brand.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
