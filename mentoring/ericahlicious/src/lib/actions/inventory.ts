"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

export async function getIngredients(filters?: {
  categoryId?: string;
  status?: string;
  search?: string;
}) {
  return db.ingredient.findMany({
    where: {
      categoryId: filters?.categoryId || undefined,
      status: (filters?.status as any) || undefined,
      name: filters?.search ? { contains: filters.search } : undefined,
    },
    include: {
      category: true,
      updatedBy: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getIngredientById(id: string) {
  return db.ingredient.findUnique({
    where: { id },
    include: {
      category: true,
      updatedBy: { select: { id: true, name: true } },
      logs: { take: 10, orderBy: { createdAt: "desc" }, include: { recordedBy: { select: { name: true } } } },
    },
  });
}

export async function getInventoryCategories() {
  return db.inventoryCategory.findMany({ orderBy: { name: "asc" } });
}

export async function getInventoryLogs(ingredientId?: string) {
  return db.inventoryLog.findMany({
    where: ingredientId ? { ingredientId } : undefined,
    include: {
      ingredient: { select: { name: true } },
      recordedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

export async function createInventoryCategory(name: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const cat = await db.inventoryCategory.create({ data: { name } });
  revalidatePath("/ingredients");
  return cat;
}

export async function createIngredient(data: {
  name: string;
  categoryId: string;
  stock: number;
  unit: string;
  supplier?: string;
  expiryDate?: Date | null;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const status = data.stock === 0 ? "CRITICAL" : data.stock < 1 ? "CRITICAL" : data.stock < 3 ? "LOW" : "GOOD";

  const item = await db.ingredient.create({
    data: {
      name: data.name,
      categoryId: data.categoryId,
      stock: data.stock,
      unit: data.unit,
      supplier: data.supplier,
      expiryDate: data.expiryDate ?? null,
      status: status as any,
      updatedById: session.user.id,
    },
    include: { category: true, updatedBy: { select: { id: true, name: true } } },
  });
  revalidatePath("/ingredients");
  return item;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE / ADJUST STOCK
// ─────────────────────────────────────────────────────────────────────────────

export async function updateIngredient(
  id: string,
  data: {
    name?: string;
    categoryId?: string;
    unit?: string;
    supplier?: string | null;
    expiryDate?: Date | null;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const item = await db.ingredient.update({
    where: { id },
    data: { ...data, updatedById: session.user.id },
    include: { category: true, updatedBy: { select: { id: true, name: true } } },
  });
  revalidatePath("/ingredients");
  return item;
}

export async function recordInventoryAdjustment(data: {
  ingredientId: string;
  type: "RECEIVE" | "CONSUME" | "WASTE" | "ADJUSTMENT";
  quantityChanged: number;
  reason?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const ingredient = await db.ingredient.findUnique({ where: { id: data.ingredientId } });
  if (!ingredient) throw new Error("Ingredient not found");

  const previousStock = Number(ingredient.stock);
  const delta =
    data.type === "RECEIVE"
      ? Math.abs(data.quantityChanged)
      : data.type === "CONSUME" || data.type === "WASTE"
      ? -Math.abs(data.quantityChanged)
      : data.quantityChanged;

  const newStock = Math.max(0, previousStock + delta);
  const status = newStock === 0 ? "CRITICAL" : newStock < 1 ? "CRITICAL" : newStock < 3 ? "LOW" : "GOOD";

  // Transactional update
  const [log] = await db.$transaction([
    db.inventoryLog.create({
      data: {
        ingredientId: data.ingredientId,
        type: data.type,
        quantityChanged: data.quantityChanged,
        reason: data.reason,
        previousStock,
        newStock,
        recordedById: session.user.id,
      },
    }),
    db.ingredient.update({
      where: { id: data.ingredientId },
      data: { stock: newStock, status: status as any, updatedById: session.user.id },
    }),
  ]);

  revalidatePath("/ingredients");
  return log;
}
