"use server";

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// ─────────────────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────────────────

export async function getMenuItems(filters?: {
  categoryId?: string;
  search?: string;
  includeArchived?: boolean;
}) {
  return db.menuItem.findMany({
    where: {
      status: filters?.includeArchived ? undefined : "ACTIVE",
      categoryId: filters?.categoryId || undefined,
      name: filters?.search ? { contains: filters.search } : undefined,
    },
    include: {
      category: true,
      ingredients: { include: { ingredient: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getMenuItemById(id: string) {
  return db.menuItem.findUnique({
    where: { id },
    include: {
      category: true,
      ingredients: { include: { ingredient: true } },
    },
  });
}

export async function getMenuCategories() {
  return db.menuCategory.findMany({ orderBy: { name: "asc" } });
}

// ─────────────────────────────────────────────────────────────────────────────
// CREATE
// ─────────────────────────────────────────────────────────────────────────────

export async function createMenuCategory(name: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const cat = await db.menuCategory.create({ data: { name } });
  revalidatePath("/menu");
  return cat;
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  imageUrl?: string;
  promoPrice?: number | null;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const item = await db.menuItem.create({
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      imageUrl: data.imageUrl,
      promoPrice: data.promoPrice ?? null,
      status: "ACTIVE",
    },
    include: { category: true, ingredients: { include: { ingredient: true } } },
  });
  revalidatePath("/menu");
  return item;
}

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE
// ─────────────────────────────────────────────────────────────────────────────

export async function updateMenuItem(
  id: string,
  data: {
    name?: string;
    description?: string | null;
    price?: number;
    categoryId?: string;
    imageUrl?: string | null;
    promoPrice?: number | null;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const item = await db.menuItem.update({
    where: { id },
    data,
    include: { category: true, ingredients: { include: { ingredient: true } } },
  });
  revalidatePath("/menu");
  return item;
}

export async function archiveMenuItem(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.menuItem.update({ where: { id }, data: { status: "ARCHIVED" } });
  revalidatePath("/menu");
}

export async function restoreMenuItem(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.menuItem.update({ where: { id }, data: { status: "ACTIVE" } });
  revalidatePath("/menu");
}

// ─────────────────────────────────────────────────────────────────────────────
// INGREDIENT LINKING
// ─────────────────────────────────────────────────────────────────────────────

export async function linkIngredientToMenuItem(
  menuItemId: string,
  ingredientId: string,
  quantity: number,
  unit: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.menuItemIngredient.upsert({
    where: { menuItemId_ingredientId: { menuItemId, ingredientId } },
    create: { menuItemId, ingredientId, quantity, unit },
    update: { quantity, unit },
  });
  revalidatePath("/menu");
}

export async function unlinkIngredientFromMenuItem(menuItemId: string, ingredientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.menuItemIngredient.deleteMany({ where: { menuItemId, ingredientId } });
  revalidatePath("/menu");
}
