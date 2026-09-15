"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function getMenuItems(filters?: {
  category?: string;
  search?: string;
  includeArchived?: boolean;
}) {
  const where: Prisma.MenuItemWhereInput = {
    ...(filters?.search && {
      OR: [
        { name: { contains: filters.search } },
        { description: { contains: filters.search } },
      ],
    }),
    ...(filters?.category && { category: filters.category }),
    ...(filters?.includeArchived === false && { isArchived: false }),
  };

  return db.menuItem.findMany({
    where,
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMenuItemById(id: string) {
  return db.menuItem.findUnique({
    where: { id },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
      orderItems: {
        include: {
          order: true,
        },
      },
    },
  });
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  promoPrice?: number;
}) {
  return db.menuItem.create({
    data: {
      name: data.name,
      description: data.description || null,
      price: data.price,
      category: data.category,
      imageUrl: data.imageUrl || null,
      promoPrice: data.promoPrice || null,
    },
  });
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
  return db.menuItem.update({
    where: { id },
    data,
  });
}

export async function deleteMenuItem(id: string) {
  return db.menuItem.update({
    where: { id },
    data: { isArchived: true },
  });
}

export async function getMenuCategories() {
  const items = await db.menuItem.findMany({
    where: { isArchived: false },
    distinct: ["category"],
    select: { category: true },
  });
  return items.map((item) => item.category).sort();
}

export async function linkIngredientToMenuItem(
  menuItemId: string,
  ingredientId: string,
  quantity: number,
  unit: string
) {
  // First, check if link already exists
  const existing = await db.menuItemIngredient.findFirst({
    where: { menuItemId, ingredientId },
  });

  if (existing) {
    return db.menuItemIngredient.update({
      where: { id: existing.id },
      data: { quantity, unit },
    });
  }

  return db.menuItemIngredient.create({
    data: {
      menuItemId,
      ingredientId,
      quantity,
      unit,
    },
  });
}

export async function unlinkIngredientFromMenuItem(
  menuItemId: string,
  ingredientId: string
) {
  return db.menuItemIngredient.deleteMany({
    where: { menuItemId, ingredientId },
  });
}

export async function getMenuItemRecipe(menuItemId: string) {
  const menuItem = await db.menuItem.findUnique({
    where: { id: menuItemId },
    include: {
      ingredients: {
        include: {
          ingredient: true,
        },
      },
    },
  });

  if (!menuItem) return null;

  return {
    id: menuItem.id,
    name: menuItem.name,
    price: menuItem.price,
    promoPrice: menuItem.promoPrice,
    ingredients: menuItem.ingredients.map((ing) => ({
      id: ing.id,
      name: ing.ingredient.name,
      quantity: ing.quantity,
      unit: ing.unit,
      currentStock: ing.ingredient.stock,
    })),
  };
}

export async function calculateRecipeCost(menuItemId: string): Promise<{
  totalCost: number;
  breakdown: Array<{
    name: string;
    quantity: number;
    unit: string;
    cost: number;
  }>;
  margin: number;
  marginPercent: number;
}> {
  const recipe = await getMenuItemRecipe(menuItemId);
  if (!recipe) {
    return { totalCost: 0, breakdown: [], margin: 0, marginPercent: 0 };
  }

  const breakdown: Array<{
    name: string;
    quantity: number;
    unit: string;
    cost: number;
  }> = [];
  let totalCost = 0;

  for (const ing of recipe.ingredients) {
    // Estimate cost per unit: $10 per kg for dry goods, $8 per L for liquids as baseline
    let costPerUnit = 10; // default
    if (ing.unit === "L" || ing.unit === "ml") costPerUnit = 8;
    if (ing.unit === "pieces" || ing.unit === "dozen") costPerUnit = 0.5;

    const cost = ing.quantity * costPerUnit;
    breakdown.push({
      name: ing.name,
      quantity: ing.quantity,
      unit: ing.unit,
      cost,
    });
    totalCost += cost;
  }

  const margin = recipe.price - totalCost;
  const marginPercent = recipe.price > 0 ? (margin / recipe.price) * 100 : 0;

  return { totalCost, breakdown, margin, marginPercent };
}
