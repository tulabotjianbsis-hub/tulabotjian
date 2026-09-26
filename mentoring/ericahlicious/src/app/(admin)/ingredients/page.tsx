import { getIngredients, getInventoryCategories } from "@/lib/actions/inventory";
import InventoryClient from "./InventoryClient";

export default async function InventoryPage() {
  const [ingredients, categories] = await Promise.all([
    getIngredients(),
    getInventoryCategories(),
  ]);

  const serialized = ingredients.map((ing) => ({
    id: ing.id,
    name: ing.name,
    stock: Number(ing.stock),
    unit: ing.unit,
    supplier: ing.supplier,
    expiryDate: ing.expiryDate?.toISOString() ?? null,
    status: ing.status,
    categoryId: ing.categoryId,
    category: { id: ing.category.id, name: ing.category.name },
    updatedBy: ing.updatedBy ? { name: ing.updatedBy.name } : null,
    updatedAt: ing.updatedAt.toISOString(),
  }));

  return <InventoryClient ingredients={serialized} categories={categories} />;
}
