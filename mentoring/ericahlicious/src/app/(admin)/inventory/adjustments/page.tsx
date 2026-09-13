"use client";

import { useState, useCallback, useEffect } from "react";
import {
  getIngredients,
  getInventoryLogs,
  getInventoryCategories,
} from "@/lib/actions/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

interface Ingredient {
  id: string;
  name: string;
  category: string;
  stock: number;
  unit: string;
}

interface InventoryLog {
  id: string;
  type: string;
  quantityChanged: number;
  reason: string | null;
  previousStock: number;
  newStock: number;
  createdAt: Date;
  recordedBy: { name: string } | null;
}

export default function AdjustmentsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [selectedIngredient, setSelectedIngredient] = useState<string>("");
  const [logs, setLogs] = useState<InventoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const ingredientsData = await getIngredients();
      setIngredients(ingredientsData);
      
      if (selectedIngredient) {
        const logsData = await getInventoryLogs(selectedIngredient);
        setLogs(logsData);
      }
    } catch (error) {
      console.error("Failed to load data:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedIngredient]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getAdjustmentTypeIcon = (type: string) => {
    switch (type) {
      case "RECEIVE":
        return "📦";
      case "CONSUME":
        return "🍳";
      case "WASTE":
        return "🗑️";
      case "ADJUSTMENT":
        return "🔧";
      default:
        return "📋";
    }
  };

  const getAdjustmentTypeLabel = (type: string) => {
    switch (type) {
      case "RECEIVE":
        return "Received";
      case "CONSUME":
        return "Consumed";
      case "WASTE":
        return "Wasted";
      case "ADJUSTMENT":
        return "Adjustment";
      default:
        return type;
    }
  };

  const getAdjustmentColor = (type: string) => {
    switch (type) {
      case "RECEIVE":
        return "bg-green-50 border-green-200";
      case "CONSUME":
        return "bg-blue-50 border-blue-200";
      case "WASTE":
        return "bg-red-50 border-red-200";
      case "ADJUSTMENT":
        return "bg-yellow-50 border-yellow-200";
      default:
        return "bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Inventory Adjustments</h1>
        <p className="text-gray-600 mt-1">Track all inventory changes and adjustments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filter by Ingredient</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedIngredient} onValueChange={setSelectedIngredient}>
            <SelectTrigger>
              <SelectValue placeholder="Select an ingredient to view adjustments" />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {ingredients.map((ing) => (
                <SelectItem key={ing.id} value={ing.id}>
                  {ing.name} ({ing.stock.toFixed(2)} {ing.unit})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {!selectedIngredient ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Select an ingredient to view its adjustment history</p>
          </CardContent>
        </Card>
      ) : loading ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Loading adjustments...</p>
          </CardContent>
        </Card>
      ) : logs.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">No adjustments recorded for this ingredient</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className={`border ${getAdjustmentColor(log.type)}`}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getAdjustmentTypeIcon(log.type)}</span>
                      <div>
                        <h3 className="font-semibold">
                          {getAdjustmentTypeLabel(log.type)}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {new Date(log.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-gray-700 space-y-1 mt-2">
                      <p>
                        <span className="font-medium">Quantity:</span>{" "}
                        <span className="text-lg font-bold">
                          {log.type === "RECEIVE" ? "+" : "-"}
                          {log.quantityChanged}
                        </span>
                      </p>
                      <p>
                        <span className="font-medium">Stock Change:</span>{" "}
                        {log.previousStock.toFixed(2)} → {log.newStock.toFixed(2)}
                      </p>
                      {log.reason && (
                        <p>
                          <span className="font-medium">Reason:</span> {log.reason}
                        </p>
                      )}
                      {log.recordedBy && (
                        <p>
                          <span className="font-medium">Recorded by:</span>{" "}
                          {log.recordedBy.name}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge
                      variant={
                        log.type === "RECEIVE"
                          ? "default"
                          : log.type === "WASTE"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {log.newStock.toFixed(2)} units
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
