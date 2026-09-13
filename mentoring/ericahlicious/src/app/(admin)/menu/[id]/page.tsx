"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  getMenuItemRecipe,
  calculateRecipeCost,
  getMenuItems,
  getIngredients,
  linkIngredientToMenuItem,
  unlinkIngredientFromMenuItem,
} from "@/lib/actions/menu";
import { getIngredients as getAllIngredients } from "@/lib/actions/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Recipe {
  id: string;
  name: string;
  price: number;
  promoPrice: number | null;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    currentStock: number;
  }>;
}

interface Ingredient {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
}

interface RecipeCost {
  totalCost: number;
  breakdown: Array<{
    name: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
  margin: number;
  marginPercent: number;
}

export default function MenuItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const menuItemId = params.id as string;

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [cost, setCost] = useState<RecipeCost | null>(null);
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isAddingIngredient, setIsAddingIngredient] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState("");
  const [quantity, setQuantity] = useState("0");

  const loadData = async () => {
    setLoading(true);
    try {
      const [recipeData, costData, ingredientsData] = await Promise.all([
        getMenuItemRecipe(menuItemId),
        calculateRecipeCost(menuItemId),
        getAllIngredients(),
      ]);
      setRecipe(recipeData);
      setCost(costData);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error("Failed to load recipe:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [menuItemId]);

  const handleAddIngredient = async () => {
    if (!selectedIngredient || Number(quantity) <= 0) return;

    try {
      const ing = ingredients.find((i) => i.id === selectedIngredient);
      if (!ing) return;

      await linkIngredientToMenuItem(
        menuItemId,
        selectedIngredient,
        Number(quantity),
        ing.unit
      );

      setSelectedIngredient("");
      setQuantity("0");
      setIsAddingIngredient(false);
      await loadData();
    } catch (error) {
      console.error("Failed to add ingredient:", error);
    }
  };

  const handleRemoveIngredient = async (ingredientId: string) => {
    try {
      await unlinkIngredientFromMenuItem(menuItemId, ingredientId);
      await loadData();
    } catch (error) {
      console.error("Failed to remove ingredient:", error);
    }
  };

  if (loading) {
    return <p className="text-center text-gray-500 py-8">Loading recipe...</p>;
  }

  if (!recipe) {
    return <p className="text-center text-gray-500 py-8">Recipe not found</p>;
  }

  const selectedIngredientData = ingredients.find((i) => i.id === selectedIngredient);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={() => router.back()}>
          ← Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{recipe.name}</h1>
          <p className="text-gray-600 mt-1">Manage recipe and ingredients</p>
        </div>
      </div>

      {/* Menu Item Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Menu Item Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Price:</span>
            <span className="font-semibold">${recipe.price.toFixed(2)}</span>
          </div>
          {recipe.promoPrice && (
            <div className="flex justify-between">
              <span className="text-gray-600">Promo Price:</span>
              <span className="font-semibold text-red-600">
                ${recipe.promoPrice.toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      {cost && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Profitability Analysis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-blue-50 rounded">
              <span className="text-gray-700">Total Cost:</span>
              <span className="text-lg font-bold">${cost.totalCost.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-green-50 rounded">
              <span className="text-gray-700">Profit Margin:</span>
              <span className="text-lg font-bold text-green-600">
                ${cost.margin.toFixed(2)} ({cost.marginPercent.toFixed(0)}%)
              </span>
            </div>

            {cost.breakdown.length > 0 && (
              <div className="mt-4">
                <h4 className="font-semibold text-sm mb-2">Cost Breakdown:</h4>
                <div className="space-y-1 text-sm">
                  {cost.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-gray-700">
                      <span>
                        {item.name} ({item.quantity} {item.unit})
                      </span>
                      <span>${item.cost.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recipe Ingredients */}
      <Card>
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-base">Recipe Ingredients</CardTitle>
          <Button
            size="sm"
            onClick={() => setIsAddingIngredient(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            + Add Ingredient
          </Button>
        </CardHeader>
        <CardContent>
          {recipe.ingredients.length === 0 ? (
            <p className="text-center text-gray-500 py-4">
              No ingredients added yet. Click "Add Ingredient" to start.
            </p>
          ) : (
            <div className="space-y-2">
              {recipe.ingredients.map((ing) => (
                <div
                  key={ing.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded border"
                >
                  <div>
                    <h4 className="font-semibold">{ing.name}</h4>
                    <p className="text-sm text-gray-600">
                      {ing.quantity} {ing.unit}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">
                      Stock: {ing.currentStock.toFixed(2)} {ing.unit}
                    </Badge>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveIngredient(ing.id)}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Ingredient Dialog */}
      <Dialog open={isAddingIngredient} onOpenChange={setIsAddingIngredient}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add Ingredient to Recipe</DialogTitle>
            <DialogDescription>
              Select an ingredient and specify the quantity needed
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ingredient *</Label>
              <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
                <SelectTrigger>
                  <SelectValue placeholder="Select ingredient" />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  {ingredients.map((ing) => (
                    <SelectItem key={ing.id} value={ing.id}>
                      {ing.name} ({ing.stock} {ing.unit})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity *</Label>
              <div className="flex gap-2">
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="flex-1"
                />
                {selectedIngredientData && (
                  <span className="flex items-center text-sm text-gray-600 px-2 py-1 bg-gray-100 rounded">
                    {selectedIngredientData.unit}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => setIsAddingIngredient(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleAddIngredient}
                disabled={!selectedIngredient || Number(quantity) <= 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
