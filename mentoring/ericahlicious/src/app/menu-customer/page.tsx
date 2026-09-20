"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_MENU_ITEMS, MOCK_MENU_CATEGORIES } from "@/lib/mock-data";

export default function CustomerMenuPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);

  const categories = ["Recommendation", "Promos", "All", ...MOCK_MENU_CATEGORIES];

  const filteredItems = MOCK_MENU_ITEMS.filter((item) => {
    if (activeCategory !== "All" && activeCategory !== "Recommendation" && activeCategory !== "Promos") {
      if (item.category !== activeCategory) return false;
    }
    if (activeCategory === "Promos" && !item.promoPrice) return false;
    // For recommendation, just show top 3
    if (activeCategory === "Recommendation" && !["menu-1", "menu-2", "menu-3"].includes(item.id)) return false;

    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="customer-layout">
      <div className="customer-topbar">
        <h1 className="customer-page-title">Menu</h1>
        <button className="cart-badge-btn" onClick={() => alert("Cart feature is mock")}>
          🛒
          {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
        </button>
      </div>

      <div className="customer-search-wrap">
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 12, top: 10, opacity: 0.5 }}>🔍</span>
          <input
            type="text"
            className="customer-search"
            placeholder="Search menu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="customer-cat-chips">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`customer-cat-chip ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === "Pasta" && "🍝 "}
            {cat === "Coffee / Iced Drinks" && "☕ "}
            {cat === "Cakes" && "🍰 "}
            {cat === "Promos" && "🔥 "}
            {cat}
          </button>
        ))}
      </div>

      <div className="customer-menu-list">
        {filteredItems.map((item) => (
          <div key={item.id} className="customer-item-card">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="customer-item-img" />
            ) : (
              <div className="customer-item-img-placeholder">
                {item.category.includes("Coffee") ? "☕" : item.category.includes("Cake") ? "🍰" : "🍽️"}
              </div>
            )}
            
            <div className="customer-item-body">
              <div className="customer-item-name">{item.name}</div>
              <div className="customer-item-desc">{item.description}</div>
              
              <div className="customer-item-footer">
                <div className="flex gap-2 items-center">
                  <div className="customer-item-price">₱{item.promoPrice || item.price}</div>
                  {item.promoPrice && (
                    <div style={{ textDecoration: "line-through", color: "hsl(30, 20%, 60%)", fontSize: 13 }}>
                      ₱{item.price}
                    </div>
                  )}
                </div>
                <button
                  className="btn-add-to-cart"
                  onClick={() => setCartCount((c) => c + 1)}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12" style={{ color: "hsl(30, 20%, 50%)" }}>
          No items found.
        </div>
      )}

      {/* Back button */}
      <div style={{ position: "fixed", bottom: 20, width: "100%", maxWidth: 430, textAlign: "center" }}>
        <Link href="/" style={{ fontSize: 13, color: "hsl(30, 20%, 60%)", background: "#fff", padding: "8px 16px", borderRadius: 20, boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}
