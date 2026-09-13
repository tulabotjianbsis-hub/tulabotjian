"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getIngredients,
  getInventoryCategories,
  recordInventoryAdjustment,
} from "@/lib/actions/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IngredientForm } from "@/components/inventory/ingredient-form";

interface Ingredient {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
  supplier: string | null;
  expiryDate: Date | null;
  status: IngredientStatus;
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Ingredient | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAdjustmentOpen, setIsAdjustmentOpen] = useState(false);
  const [adjustmentItem, setAdjustmentItem] = useState<Ingredient | null>(null);

  const [adjustmentForm, setAdjustmentForm] = useState({
    type: "RECEIVE" as string,
    quantity: 0,
    reason: "",
  });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [ingredientsData, categoriesData] = await Promise.all([
        getIngredients(),
        getInventoryCategories(),
      ]);
      setIngredients(ingredientsData);
      setCategories(categoriesData);
    } catch (error) {
      console.error("Failed to load ingredients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredIngredients = ingredients.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" || item.category === selectedCategory;
    const matchesStatus = selectedStatus === "all" || item.status === selectedStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleRecordAdjustment = async () => {
    if (!adjustmentItem || adjustmentForm.quantity <= 0) return;

    try {
      await recordInventoryAdjustment({
        ingredientId: adjustmentItem.id,
        type: adjustmentForm.type,
        quantityChanged: adjustmentForm.quantity,
        reason: adjustmentForm.reason || undefined,
      });
      setIsAdjustmentOpen(false);
      setAdjustmentItem(null);
      setAdjustmentForm({ type: "RECEIVE", quantity: 0, reason: "" });
      loadData();
    } catch (error) {
      console.error("Failed to record adjustment:", error);
    }
  };

  const getStatusColor = (status: IngredientStatus) => {
    switch (status) {
      case "CRITICAL":
        return "destructive";
      case "LOW":
        return "secondary";
      case "EXPIRED":
        return "default";
      default:
        return "outline";
    }
  };

  const getStatusLabel = (status: IngredientStatus) => {
    switch (status) {
      case "CRITICAL":
        return "🔴 Critical";
      case "LOW":
        return "🟠 Low";
      case "EXPIRED":
        return "☠️ Expired";
      default:
        return "✓ Good";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
        <p className="text-gray-600 mt-1">Track ingredients and stock levels</p>
      </div>

      <div className="flex gap-4 flex-wrap">
        <Input
          placeholder="Search ingredients..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-48"
        />
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>
                {cat}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="GOOD">✓ Good</SelectItem>
            <SelectItem value="LOW">🟠 Low</SelectItem>
            <SelectItem value="CRITICAL">🔴 Critical</SelectItem>
            <SelectItem value="EXPIRED">☠️ Expired</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          + New Ingredient
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading ingredients...</p>
          </CardContent>
        </Card>
      ) : filteredIngredients.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No ingredients found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredIngredients.map((item) => {
            const isExpiring =
              item.expiryDate &&
              new Date(item.expiryDate) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) &&
              new Date(item.expiryDate) > new Date();

            return (
              <Card key={item.id} className="border-l-4 border-l-gray-300">
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <Badge variant={getStatusColor(item.status)}>
                          {getStatusLabel(item.status)}
                        </Badge>
                        {isExpiring && (
                          <Badge variant="default" className="bg-amber-600">
                            ⏰ Expiring Soon
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>
                          <span className="font-medium">Category:</span> {item.category}
                        </p>
                        <p>
                          <span className="font-medium">Stock:</span> {item.stock.toFixed(2)} {item.unit}
                        </p>
                        {item.supplier && (
                          <p>
                            <span className="font-medium">Supplier:</span> {item.supplier}
                          </p>
                        )}
                        {item.expiryDate && (
                          <p>
                            <span className="font-medium">Expiry:</span>{" "}
                            {new Date(item.expiryDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-col">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingItem(item);
                          setIsEditOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setAdjustmentItem(item);
                          setIsAdjustmentOpen(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Record Adjustment
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Ingredient</DialogTitle>
            <DialogDescription>
              Add a new ingredient to your inventory
            </DialogDescription>
          </DialogHeader>
          <IngredientForm
            categories={categories}
            onSuccess={() => {
              setIsCreateOpen(false);
              loadData();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Ingredient</DialogTitle>
            <DialogDescription>
              Update ingredient details
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <IngredientForm
              initialData={{
                id: editingItem.id,
                name: editingItem.name,
                category: editingItem.category,
                stock: editingItem.stock,
                unit: editingItem.unit,
                supplier: editingItem.supplier,
                expiryDate: editingItem.expiryDate?.toISOString().split("T")[0],
              }}
              categories={categories}
              onSuccess={() => {
                setIsEditOpen(false);
                setEditingItem(null);
                loadData();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Adjustment Dialog */}
      <Dialog open={isAdjustmentOpen} onOpenChange={setIsAdjustmentOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Record Inventory Adjustment</DialogTitle>
            <DialogDescription>
              {adjustmentItem?.name} (Current: {adjustmentItem?.stock.toFixed(2)} {adjustmentItem?.unit})
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type *</Label>
              <Select
                value={adjustmentForm.type}
                onValueChange={(value) =>
                  setAdjustmentForm({ ...adjustmentForm, type: value as string })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="RECEIVE">📦 Receive (Stock In)</SelectItem>
                  <SelectItem value="CONSUME">🍳 Consume (Used)</SelectItem>
                  <SelectItem value="WASTE">🗑️ Waste (Spoilage)</SelectItem>
                  <SelectItem value="ADJUSTMENT">🔧 Adjustment (Manual)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={adjustmentForm.quantity}
                onChange={(e) =>
                  setAdjustmentForm({
                    ...adjustmentForm,
                    quantity: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason</Label>
              <Input
                id="reason"
                placeholder="Optional reason"
                value={adjustmentForm.reason}
                onChange={(e) =>
                  setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })
                }
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAdjustmentOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRecordAdjustment}
                disabled={adjustmentForm.quantity <= 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Record
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
