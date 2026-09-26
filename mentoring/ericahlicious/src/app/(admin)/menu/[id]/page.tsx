"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getMenuItemById, linkIngredientToMenuItem, unlinkIngredientFromMenuItem } from "@/lib/actions/menu";
import { getIngredients as getAllIngredients } from "@/lib/actions/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const menuItemId = params.id as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<any[]>([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [unit, setUnit] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [itemData, ingredientsData] = await Promise.all([
        getMenuItemById(menuItemId),
        getAllIngredients(),
      ]);
      setItem(itemData);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error("Failed to load item:", error);
    } finally {
      setLoading(false);
    }
  }, [menuItemId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddIngredient = async () => {
    if (!selectedIngredient || Number(quantity) <= 0) return;
    const ing = ingredients.find((i) => i.id === selectedIngredient);
    await linkIngredientToMenuItem(menuItemId, selectedIngredient, Number(quantity), unit || ing?.unit || "g");
    setSelectedIngredient("");
    setQuantity("0");
    setUnit("");
    setIsAddingIngredient(false);
    await loadData();
  };

  const handleRemoveIngredient = async (ingredientId: string) => {
    await unlinkIngredientFromMenuItem(menuItemId, ingredientId);
    await loadData();
  };

  if (loading) return <p className="text-center py-8">Loading...</p>;
  if (!item) return <p className="text-center py-8">Menu item not found</p>;

  const selectedIngData = ingredients.find((i) => i.id === selectedIngredient);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>← Back</Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{item.name}</h1>
          <p className="text-gray-600 mt-1">Manage recipe and ingredients</p>
        </div>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Menu Item Details</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold">₱{Number(item.price).toFixed(2)}</span>
          </div>
          {item.promoPrice && (
            <div className="flex justify-between">
              <span className="text-gray-600">Promo Price:</span>
              <span className="font-semibold text-red-600">₱{Number(item.promoPrice).toFixed(2)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Category:</span>
            <span className="font-semibold">{item.category?.name}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-base">Recipe Ingredients</CardTitle>
          <Button size="sm" onClick={() => setIsAddingIngredient(true)} className="bg-blue-600 hover:bg-blue-700">
            + Add Ingredient
          </Button>
        </CardHeader>
        <CardContent>
          {item.ingredients.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No ingredients added yet.</p>
          ) : (
            <div className="space-y-2">
              {item.ingredients.map((ing: any) => (
                <div key={ing.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                  <div>
                    <h4 className="font-semibold">{ing.ingredient.name}</h4>
                    <p className="text-sm text-gray-600">{Number(ing.quantity)} {ing.unit}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">Stock: {Number(ing.ingredient.stock)} {ing.ingredient.unit}</Badge>
                    <Button variant="destructive" size="sm" onClick={() => handleRemoveIngredient(ing.ingredientId)}>Remove</Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isAddingIngredient} onOpenChange={setIsAddingIngredient}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Ingredient to Recipe</DialogTitle>
            <DialogDescription>Select an ingredient and specify the quantity needed</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ingredient *</Label>
              <Select value={selectedIngredient} onValueChange={(v) => setSelectedIngredient(v || "")}>
                <SelectTrigger><SelectValue placeholder="Select ingredient" /></SelectTrigger>
                <SelectContent className="max-h-60">
                  {ingredients.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id}>
                      {ing.name} ({Number(ing.stock)} {ing.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Quantity *</Label>
              <div className="flex gap-2">
                <Input type="number" step="0.01" min="0" placeholder="0" value={quantity} onChange={(e) => setQuantity(e.target.value)} className="flex-1" />
                <Input placeholder={selectedIngData?.unit ?? "unit"} value={unit} onChange={(e) => setUnit(e.target.value)} style={{ width: 80 }} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setIsAddingIngredient(false)}>Cancel</Button>
              <Button onClick={handleAddIngredient} disabled={!selectedIngredient || Number(quantity) <= 0} className="bg-blue-600 hover:bg-blue-700">Add</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
