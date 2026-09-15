"use server";

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
type AdjustmentType = "RECEIVE" | "CONSUME" | "WASTE" | "ADJUSTMENT";
type IngredientStatus = "GOOD" | "LOW" | "CRITICAL" | "EXPIRED";
import { auth } from "@/auth";


export async function getIngredients(filters?: {
  category?: string;
  search?: string;
  status?: IngredientStatus;
}) {
  const where: Prisma.IngredientWhereInput = {
    ...(filters?.search && {
      name: { contains: filters.search },
    }),
    ...(filters?.category && { category: filters.category }),
    ...(filters?.status && { status: filters.status }),
  };

  return db.ingredient.findMany({
    where,
    include: {
      logs: { orderBy: { createdAt: "desc" }, take: 5 },
      updatedBy: { select: { name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getIngredientById(id: string) {
  return db.ingredient.findUnique({
    where: { id },
    include: {
      logs: { orderBy: { createdAt: "desc" } },
      updatedBy: { select: { name: true } },
      menuItems: { include: { menuItem: true } },
    },
  });
}

export async function createIngredient(data: {
  name: string;
  category: string;
  stock: number;
  unit: string;
  supplier?: string;
  expiryDate?: Date;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.ingredient.create({
    data: {
      name: data.name,
      category: data.category,
      stock: data.stock,
      unit: data.unit,
      supplier: data.supplier || null,
      expiryDate: data.expiryDate || null,
      status: "GOOD",
      updatedById: session.user.id,
    },
  });
}

export async function updateIngredient(
  id: string,
  data: {
    name?: string;
    category?: string;
    unit?: string;
    supplier?: string;
    expiryDate?: Date | null;
  }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  return db.ingredient.update({
    where: { id },
    data: {
      ...data,
      updatedById: session.user.id,
    },
  });
}

export async function recordInventoryAdjustment(data: {
  ingredientId: string;
  type: AdjustmentType;
  quantityChanged: number;
  reason?: string;
}) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const ingredient = await db.ingredient.findUnique({
    where: { id: data.ingredientId },
  });

  if (!ingredient) throw new Error("Ingredient not found");

  const previousStock = Number(ingredient.stock);
  let newStock = previousStock;

  if (data.type === "RECEIVE") {
    newStock += data.quantityChanged;
  } else if (["CONSUME", "WASTE", "ADJUSTMENT"].includes(data.type)) {
    newStock = Math.max(0, newStock - data.quantityChanged);
  }

  // Update ingredient stock
  const updatedIngredient = await db.ingredient.update({
    where: { id: data.ingredientId },
    data: {
      stock: newStock,
      updatedById: session.user.id,
    },
  });

  // Create log entry
  const log = await db.inventoryLog.create({
    data: {
      ingredientId: data.ingredientId,
      type: data.type,
      quantityChanged: data.quantityChanged,
      reason: data.reason || null,
      previousStock: previousStock,
      newStock: newStock,
      recordedById: session.user.id,
    },
  });

  // Check if status needs updating
  await updateIngredientStatus(data.ingredientId);

  return { ingredient: updatedIngredient, log };
}

export async function getInventoryLogs(
  ingredientId: string,
  limit: number = 50
) {
  return db.inventoryLog.findMany({
    where: { ingredientId },
    include: {
      recordedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getInventoryCategories() {
  const ingredients = await db.ingredient.findMany({
    distinct: ["category"],
    select: { category: true },
  });
  return ingredients.map((i) => i.category).sort();
}

export async function updateIngredientStatus(ingredientId: string) {
  const ingredient = await db.ingredient.findUnique({
    where: { id: ingredientId },
  });

  if (!ingredient) return;

  let newStatus: IngredientStatus = "GOOD";

  // Check expiry
  if (ingredient.expiryDate && ingredient.expiryDate < new Date()) {
    newStatus = "EXPIRED";
  }
  // Check stock levels (simple heuristic: if stock is 0, mark critical)
  else if (ingredient.stock === 0) {
    newStatus = "CRITICAL";
  } else if (ingredient.stock < 5) {
    // Simple threshold: less than 5 units is low
    newStatus = "LOW";
  }

  if (newStatus !== ingredient.status) {
    await db.ingredient.update({
      where: { id: ingredientId },
      data: { status: newStatus },
    });
  }
}

export async function calculateRecipeCost(menuItemId: string): Promise<number> {
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

  if (!menuItem) return 0;

  let totalCost = 0;
  for (const itemIngredient of menuItem.ingredients) {

    // Simple cost calculation: assume price per unit is based on average
    // For MVP, we'll calculate: (stock * quantity) / quantity = per-unit cost estimate
    // In production, you'd have a separate cost_per_unit field
    const ingredientCost = Number(itemIngredient.quantity);
    totalCost += ingredientCost;
  }

  return totalCost;
}
