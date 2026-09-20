"use server";

import {
  MOCK_MENU_ITEMS,
  MOCK_INGREDIENTS,
  MOCK_MENU_CATEGORIES,
  type MockMenuItem,
} from "@/lib/mock-data";

// In-memory mutable store
let menuItems: MockMenuItem[] = [...MOCK_MENU_ITEMS];

export async function getMenuItems(filters?: {
  category?: string;
  search?: string;
  includeArchived?: boolean;
}) {
  let result = [...menuItems];
  if (filters?.includeArchived === false) result = result.filter((m) => !m.isArchived);
  if (filters?.category) result = result.filter((m) => m.category === filters.category);
  if (filters?.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (m) => m.name.toLowerCase().includes(q) || (m.description || "").toLowerCase().includes(q)
    );
  }
  return result;
}

export async function getMenuItemById(id: string) {
  return menuItems.find((m) => m.id === id) || null;
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  promoPrice?: number;
}) {
  const newItem = {
    id: `menu-${Date.now()}`,
    name: data.name,
    description: data.description || null,
    price: data.price,
    category: data.category,
    imageUrl: data.imageUrl || null,
    isArchived: false,
    promoPrice: data.promoPrice || null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ingredients: [],
  };
  menuItems = [newItem, ...menuItems];
  return newItem;
}

export async function updateMenuItem(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    price?: number;
    category?: string;
    imageUrl?: string | null;
    promoPrice?: number | null;
    isArchived?: boolean;
  }
) {
  menuItems = menuItems.map((m) =>
    m.id === id ? { ...m, ...data, updatedAt: new Date() } : m
  );
  return menuItems.find((m) => m.id === id) || null;
}

export async function deleteMenuItem(id: string) {
  return updateMenuItem(id, { isArchived: true });
}

export async function getMenuCategories() {
  const fromItems = [...new Set(menuItems.filter((m) => !m.isArchived).map((m) => m.category))];
  return fromItems.length > 0 ? fromItems.sort() : MOCK_MENU_CATEGORIES;
}

export async function linkIngredientToMenuItem(
  menuItemId: string,
  ingredientId: string,
  quantity: number,
  unit: string
) {
  const ingredient = MOCK_INGREDIENTS.find((i) => i.id === ingredientId);
  menuItems = menuItems.map((m): MockMenuItem => {
    if (m.id !== menuItemId) return m;
    const existing = m.ingredients.find((i) => i.id === ingredientId);
    if (existing) {
      return {
        ...m,
        ingredients: m.ingredients.map((i) =>
          i.id === ingredientId ? { ...i, quantity, unit } : i
        ),
      };
    }
    return {
      ...m,
      ingredients: [
        ...m.ingredients,
        {
          id: ingredientId,
          name: ingredient?.name || "Unknown",
          quantity,
          unit,
          currentStock: ingredient?.stock || 0,
        },
      ],
    };
  });
  return { menuItemId, ingredientId, quantity, unit };
}

export async function unlinkIngredientFromMenuItem(menuItemId: string, ingredientId: string) {
  menuItems = menuItems.map((m) =>
    m.id === menuItemId
      ? { ...m, ingredients: m.ingredients.filter((i: { id: string }) => i.id !== ingredientId) }
      : m
  );
  return { count: 1 };
}

export async function getMenuItemRecipe(menuItemId: string) {
  const menuItem = menuItems.find((m) => m.id === menuItemId);
  if (!menuItem) return null;
  return {
    id: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    promoPrice: menuItem.promoPrice,
    ingredients: menuItem.ingredients as Array<{
      id: string; name: string; quantity: number; unit: string; currentStock: number;
    }>,
  };
}

export async function calculateRecipeCost(menuItemId: string): Promise<{
  totalCost: number;
  breakdown: Array<{ name: string; quantity: number; unit: string; cost: number }>;
  margin: number;
  marginPercent: number;
}> {
  const recipe = await getMenuItemRecipe(menuItemId);
  if (!recipe) return { totalCost: 0, breakdown: [], margin: 0, marginPercent: 0 };

  const breakdown: Array<{ name: string; quantity: number; unit: string; cost: number }> = [];
  let totalCost = 0;

  for (const ing of recipe.ingredients) {
    let costPerUnit = 10;
    if (ing.unit === "L" || ing.unit === "ml") costPerUnit = 8;
    if (ing.unit === "pieces" || ing.unit === "dozen") costPerUnit = 0.5;
    const cost = ing.quantity * costPerUnit;
    breakdown.push({ name: ing.name, quantity: ing.quantity, unit: ing.unit, cost });
    totalCost += cost;
  }

  const margin = recipe.price - totalCost;
  const marginPercent = recipe.price > 0 ? (margin / recipe.price) * 100 : 0;
  return { totalCost, breakdown, margin, marginPercent };
}
