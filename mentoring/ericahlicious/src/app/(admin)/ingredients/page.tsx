"use client";

import { useState } from "react";
import { MOCK_INGREDIENTS, MOCK_INVENTORY_CATEGORIES } from "@/lib/mock-data";

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "GOOD": return "badge badge-good";
    case "LOW": return "badge badge-low";
    case "CRITICAL": return "badge badge-critical";
    default: return "badge badge-completed";
  }
}

export default function InventoryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("Pasta");
  const [search, setSearch] = useState("");

  const filteredItems = MOCK_INGREDIENTS.filter((item) => {
    if (activeCategory !== "ALL" && item.category !== activeCategory) return false;
    if (search && !item.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Inventory Monitoring</h1>
        <div className="page-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search ingredients..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary">🏷️ Add Category</button>
          <button className="btn btn-primary">+ Add Stock</button>
        </div>
      </div>

      <div className="cat-tabs-row">
        {MOCK_INVENTORY_CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`cat-tab ${activeCategory === cat ? "active" : ""}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ingredient</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Supplier</th>
              <th>Expiry</th>
              <th>Status</th>
              <th>Updated by</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item.id}>
                <td style={{ fontWeight: 600 }}>{item.name}</td>
                <td>
                  <span className="badge badge-completed">{item.category}</span>
                </td>
                <td style={{ fontWeight: 600 }}>{item.stock}{item.unit}</td>
                <td>{item.supplier || "-"}</td>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {item.expiryDate ? item.expiryDate.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "-"}
                </td>
                <td>
                  <span className={getStatusBadge(item.status)}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{item.updatedBy ? (item.updatedBy as any).name : "Ana Reyes"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {filteredItems.length === 0 && (
        <div className="text-center py-12 text-muted">
          No inventory items found for this category.
        </div>
      )}
    </div>
  );
}
