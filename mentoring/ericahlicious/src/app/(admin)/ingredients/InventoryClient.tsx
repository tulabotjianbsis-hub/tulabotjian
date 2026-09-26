"use client";

import { useState } from "react";
import { recordInventoryAdjustment } from "@/lib/actions/inventory";
import { useRouter } from "next/navigation";

type Category = { id: string; name: string };
type Ingredient = {
  id: string; name: string; stock: number; unit: string;
  supplier: string | null; expiryDate: string | null;
  status: string; categoryId: string;
  category: Category;
  updatedBy: { name: string } | null;
  updatedAt: string;
};

function getStatusBadge(status: string) {
  switch (status) {
    case "GOOD":     return "badge badge-good";
    case "LOW":      return "badge badge-low";
    case "CRITICAL": return "badge badge-critical";
    default:         return "badge badge-completed";
  }
}

export default function InventoryClient({
  ingredients,
  categories,
}: {
  ingredients: Ingredient[];
  categories: Category[];
}) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [adjustId, setAdjustId] = useState<string | null>(null);
  const [adjQty, setAdjQty] = useState("");
  const [adjType, setAdjType] = useState<"RECEIVE" | "CONSUME" | "WASTE" | "ADJUSTMENT">("RECEIVE");
  const [adjReason, setAdjReason] = useState("");
  const [saving, setSaving] = useState(false);

  const filtered = ingredients.filter((ing) => {
    if (activeCategory !== "ALL" && ing.category.id !== activeCategory) return false;
    if (search && !ing.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  async function handleAdjust() {
    if (!adjustId || !adjQty) return;
    setSaving(true);
    await recordInventoryAdjustment({
      ingredientId: adjustId,
      type: adjType,
      quantityChanged: parseFloat(adjQty),
      reason: adjReason || undefined,
    });
    setSaving(false);
    setAdjustId(null);
    setAdjQty("");
    setAdjReason("");
    router.refresh();
  }

  return (
    <div>
      {/* Adjust Stock Modal */}
      {adjustId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div className="card" style={{ width: 360, padding: 24 }}>
            <h2 className="card-title">Adjust Stock</h2>
            <div className="flex-col gap-3">
              <select className="search-input" value={adjType} onChange={(e) => setAdjType(e.target.value as any)}>
                <option value="RECEIVE">Receive (Add)</option>
                <option value="CONSUME">Consume (Subtract)</option>
                <option value="WASTE">Waste (Subtract)</option>
                <option value="ADJUSTMENT">Manual Adjustment</option>
              </select>
              <input type="number" className="search-input" placeholder="Quantity" value={adjQty} onChange={(e) => setAdjQty(e.target.value)} />
              <input type="text" className="search-input" placeholder="Reason (optional)" value={adjReason} onChange={(e) => setAdjReason(e.target.value)} />
              <div className="flex gap-3">
                <button className="btn btn-primary" disabled={saving} onClick={handleAdjust}>{saving ? "Saving..." : "Save"}</button>
                <button className="btn btn-secondary" onClick={() => setAdjustId(null)}>Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Inventory Monitoring</h1>
        <div className="page-actions">
          <div className="search-wrap">
            <span className="search-icon">🔍</span>
            <input type="text" className="search-input" placeholder="Search ingredients..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <button className="btn btn-primary">+ Add Stock</button>
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

      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ingredient</th><th>Category</th><th>Stock</th><th>Supplier</th><th>Expiry</th><th>Status</th><th>Updated by</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ing) => (
              <tr key={ing.id}>
                <td style={{ fontWeight: 600 }}>{ing.name}</td>
                <td><span className="badge badge-completed">{ing.category.name}</span></td>
                <td style={{ fontWeight: 600 }}>{ing.stock} {ing.unit}</td>
                <td>{ing.supplier || "-"}</td>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>
                  {ing.expiryDate ? new Date(ing.expiryDate).toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" }) : "-"}
                </td>
                <td><span className={getStatusBadge(ing.status)}>{ing.status}</span></td>
                <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{ing.updatedBy?.name ?? "-"}</td>
                <td>
                  <button className="btn btn-secondary" style={{ fontSize: 12, padding: "4px 10px" }} onClick={() => setAdjustId(ing.id)}>
                    Adjust
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filtered.length === 0 && <div className="text-center py-12 text-muted">No items found.</div>}
    </div>
  );
}
