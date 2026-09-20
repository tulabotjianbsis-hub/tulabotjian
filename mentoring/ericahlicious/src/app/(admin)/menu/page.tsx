"use client";

import { useState } from "react";
import { MOCK_MENU_ITEMS, MOCK_MENU_CATEGORIES } from "@/lib/mock-data";

export default function MenuManagementPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Pasta");
  const [search, setSearch] = useState("");

  const filteredItems = MOCK_MENU_ITEMS.filter((item) => {
    if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Menu Management</h1>
        <div className="page-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search menu items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">🏷️ Add Category</button>
          <button className="btn btn-primary">+ Add Items</button>
          <button className="btn btn-secondary">📁 Archived</button>
        </div>
      </div>

      <div className="cat-tabs-row">
        {MOCK_MENU_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid-menu">
        {filteredItems.map((item) => (
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
                  <button className="icon-btn danger" title="Archive">📦</button>
                </div>
              </div>
              
              <div className="flex items-center gap-2 mb-2">
                <div className="menu-item-price">₱{item.price}</div>
                <div className="badge badge-completed">{item.category}</div>
              </div>
              
              <div className="menu-item-ingredients">
                <div style={{ fontWeight: 600, color: "var(--text-secondary)", marginBottom: 4 }}>
                  Ingredients ({item.ingredients.length})
                </div>
                {item.ingredients.map((ing) => `${ing.name} (${ing.quantity}${ing.unit})`).join(" · ")}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted">
          No menu items found for this category.
        </div>
      )}
    </div>
  );
}
