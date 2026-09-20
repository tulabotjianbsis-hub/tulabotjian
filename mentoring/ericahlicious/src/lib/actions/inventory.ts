"use server";

import {
  MOCK_INGREDIENTS,
  MOCK_INVENTORY_CATEGORIES,
  MOCK_INVENTORY_LOGS,
  type MockIngredient,
  type MockInventoryLog,
} from "@/lib/mock-data";

// In-memory mutable store
let ingredients: MockIngredient[] = [...MOCK_INGREDIENTS];
let inventoryLogs: MockInventoryLog[] = [...MOCK_INVENTORY_LOGS];

export async function getIngredients(filters?: {
  category?: string;
  status?: string;
  search?: string;
}) {
  let result = [...ingredients];
  if (filters?.category) result = result.filter((i) => i.category === filters.category);
  if (filters?.status) result = result.filter((i) => i.status === filters.status);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter((i) => i.name.toLowerCase().includes(q));
  }
  return result;
}

export async function getIngredientById(id: string) {
  return ingredients.find((i) => i.id === id) || null;
}

export async function createIngredient(data: {
  name: string;
  category: string;
  stock: number;
  unit: string;
  supplier?: string;
  expiryDate?: Date | null;
}) {
  const newItem = {
    id: `ing-${Date.now()}`,
    name: data.name,
    category: data.category,
    stock: data.stock,
    unit: data.unit,
    supplier: data.supplier || null,
    expiryDate: data.expiryDate || null,
    status: "GOOD",
    updatedById: null,
    updatedAt: new Date(),
    updatedBy: null,
    menuItems: [],
    logs: [],
    alerts: [],
  };
  ingredients = [newItem, ...ingredients];
  return newItem;
}

export async function updateIngredient(
  id: string,
  data: {
    name?: string;
    category?: string;
    stock?: number;
    unit?: string;
    supplier?: string | null;
    expiryDate?: Date | null;
    status?: string;
  }
) {
  ingredients = ingredients.map((i) =>
    i.id === id ? { ...i, ...data, updatedAt: new Date() } : i
  );
  return ingredients.find((i) => i.id === id) || null;
}

export async function deleteIngredient(id: string) {
  ingredients = ingredients.filter((i) => i.id !== id);
  return { id };
}

export async function getInventoryCategories() {
  const fromItems = [...new Set(ingredients.map((i) => i.category))];
  return fromItems.length > 0 ? fromItems.sort() : MOCK_INVENTORY_CATEGORIES;
}

export async function recordInventoryAdjustment(data: {
  ingredientId: string;
  type: "RECEIVE" | "CONSUME" | "WASTE" | "ADJUSTMENT";
  quantityChanged: number;
  reason?: string;
}) {
  const ingredient = ingredients.find((i) => i.id === data.ingredientId);
  if (!ingredient) throw new Error("Ingredient not found");

  const previousStock = ingredient.stock;
  const delta =
    data.type === "RECEIVE"
      ? data.quantityChanged
      : data.type === "CONSUME" || data.type === "WASTE"
      ? -Math.abs(data.quantityChanged)
      : data.quantityChanged; // ADJUSTMENT can be positive or negative

  const newStock = Math.max(0, previousStock + delta);

  // Calculate status
  const status =
    newStock === 0
      ? "EXPIRED"
      : newStock < 1
      ? "CRITICAL"
      : newStock < 3
      ? "LOW"
      : "GOOD";

  ingredients = ingredients.map((i) =>
    i.id === data.ingredientId
      ? { ...i, stock: newStock, status, updatedAt: new Date() }
      : i
  );

  const log = {
    id: `log-${Date.now()}`,
    ingredientId: data.ingredientId,
    type: data.type,
    quantityChanged: data.quantityChanged,
    reason: data.reason || null,
    previousStock,
    newStock,
    recordedById: null,
    createdAt: new Date(),
    recordedBy: { name: "System" },
  };
  inventoryLogs = [log, ...inventoryLogs];
  return log;
}

export async function getInventoryLogs(ingredientId?: string) {
  if (ingredientId) {
    return inventoryLogs.filter((l) => l.ingredientId === ingredientId);
  }
  return inventoryLogs;
}

export async function calculateIngredientCost(_menuItemId: string) {
  return 0;
}
