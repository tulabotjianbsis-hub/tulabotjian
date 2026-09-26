"use client";

import { useState } from "react";
import { archiveMenuItem } from "@/lib/actions/menu";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type MenuItem = {
  id: string; name: string; description: string | null;
  price: number; promoPrice: number | null; imageUrl: string | null;
  status: string;
  category: Category;
  ingredients: Array<{ id: string; quantity: number; unit: string; ingredient: { id: string; name: string; unit: string } }>;
};

export default function MenuClient({
  items,
  categories,
}: {
  items: MenuItem[];
  categories: Category[];
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [search, setSearch] = useState("");
  const [archiving, setArchiving] = useState<string | null>(null);

  const filtered = items.filter((item) => {
    if (activeCategory !== "ALL" && item.category.id !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleArchive(id: string) {
    setArchiving(id);
    await archiveMenuItem(id);
    setArchiving(null);
    router.refresh();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Menu Management</h1>
        <div className="page-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="Search menu items..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary">+ Add Item</button>
        </div>
      </div>

      <div className="cat-tabs-row">
        <button className={`cat-tab ${activeCategory === "ALL" ? "active" : ""}`} onClick={() => setActiveCategory("ALL")}>All</button>
        {categories.map((cat) => (
          <button key={cat.id} className={`cat-tab ${activeCategory === cat.id ? "active" : ""}`} onClick={() => setActiveCategory(cat.id)}>
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid-menu">
        {filtered.map((item) => (
          <div key={item.id} className="menu-item-card">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="menu-item-img" />
            ) : (
              <div className="menu-item-img-placeholder">🍽️</div>
            )}
            <div className="menu-item-body">
              <div className="menu-item-header">
                <div className="menu-item-name">{item.name}</div>
                <div className="menu-item-actions">
                  <button className="icon-btn" title="Edit">✏️</button>
                  <button
                    className="icon-btn danger"
                    title="Archive"
                    disabled={archiving === item.id}
                    onClick={() => handleArchive(item.id)}
                  >
                    {archiving === item.id ? "..." : "📦"}
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <div className="menu-item-price">₱{item.price}</div>
                {item.promoPrice && (
                  <div style={{ fontSize: 12, color: "var(--text-muted)", textDecoration: "line-through" }}>₱{item.price}</div>
                )}
                <div className="badge badge-completed">{item.category.name}</div>
              </div>
              {item.ingredients.length > 0 && (
                <div className="menu-item-ingredients">
                  <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                    Ingredients ({item.ingredients.length})
                  </div>
                  {item.ingredients.map((ing) => `${ing.ingredient.name} (${ing.quantity}${ing.unit})`).join(" · ")}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted">No menu items found.</div>
      )}
    </div>
  );
}
