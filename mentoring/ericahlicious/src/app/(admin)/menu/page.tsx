import { getMenuItems, getMenuCategories } from "@/lib/actions/menu";
import MenuClient from "./MenuClient";

export default async function MenuManagementPage() {
  const [items, categories] = await Promise.all([getMenuItems(), getMenuCategories()]);

  // Serialize Decimal for client
  const serializedItems = items.map((item) => ({
    ...item,
    price: Number(item.price),
    promoPrice: item.promoPrice ? Number(item.promoPrice) : null,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
    category: { id: item.category.id, name: item.category.name },
    ingredients: item.ingredients.map((ing) => ({
      id: ing.id,
      quantity: Number(ing.quantity),
      unit: ing.unit,
      ingredient: { id: ing.ingredient.id, name: ing.ingredient.name, unit: ing.ingredient.unit },
    })),
  }));

  return <MenuClient items={serializedItems} categories={categories} />;
}
