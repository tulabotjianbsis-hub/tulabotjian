"use client";

import { useState } from "react";
import { updateOrderStatus } from "@/lib/actions/orders";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  orderNumber: number;
  tableNumber: string | null;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: Array<{
    id: string;
    menuItemId: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    menuItem: { name: string };
  }>;
  processedBy: { id: string; name: string } | null;
};

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED":  return "badge badge-completed";
    case "PENDING":    return "badge badge-pending";
    case "PREPARING":  return "badge badge-preparing";
    case "READY":      return "badge badge-ready";
    case "CANCELLED":  return "badge badge-cancelled";
    default:           return "badge badge-completed";
  }
}

function formatTimeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  return `${Math.floor(mins / 60)}h ago`;
}

export default function OrdersClient({
  orders,
  dailyStats,
}: {
  orders: Order[];
  dailyStats: { total: number; pending: number; preparing: number; ready: number; completed: number; cancelled: number; totalAmount: number };
}) {
  const [activeTab, setActiveTab] = useState<"ALL" | "DAILY">("ALL");
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();

  const nextStatus: Record<string, string> = {
    PENDING: "PREPARING", PREPARING: "READY", READY: "COMPLETED",
  };

  async function handleStatusUpdate(orderId: string, status: string) {
    setLoading(orderId);
    await updateOrderStatus(orderId, status as any);
    setLoading(null);
    router.refresh();
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Orders</h1>
        <div className="tab-list boxed">
          {["ALL", "DAILY"].map((tab) => (
            <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab as any)}>
              {tab === "ALL" ? "All Orders" : "Daily Sales"}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "ALL" && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order #</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th><th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const itemsText = order.items.map((i) => `${i.menuItem.name} x${i.quantity}`).join(", ");
                const next = nextStatus[order.status];
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>#{order.orderNumber}</td>
                    <td>Table {order.tableNumber || "-"}</td>
                    <td style={{ maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={itemsText}>{itemsText}</td>
                    <td style={{ fontWeight: 600 }}>₱{order.totalAmount.toLocaleString()}</td>
                    <td><span className={getStatusBadge(order.status)}>{order.status}</span></td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{formatTimeAgo(order.createdAt)}</td>
                    <td>
                      {next && (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: 12, padding: "4px 10px" }}
                          disabled={loading === order.id}
                          onClick={() => handleStatusUpdate(order.id, next)}
                        >
                          {loading === order.id ? "..." : `→ ${next}`}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === "DAILY" && (
        <div>
          <div className="grid-4 mb-6">
            <div className="stat-card"><div className="stat-label">Total Revenue</div><div className="stat-value">₱{dailyStats.totalAmount.toLocaleString()}</div><div className="stat-sub">Today</div></div>
            <div className="stat-card"><div className="stat-label">Total Orders</div><div className="stat-value">{dailyStats.total}</div><div className="stat-sub">All orders today</div></div>
            <div className="stat-card"><div className="stat-label">Active Orders</div><div className="stat-value">{dailyStats.pending + dailyStats.preparing}</div><div className="stat-sub">Pending + Preparing</div></div>
            <div className="stat-card"><div className="stat-label">Completed</div><div className="stat-value">{dailyStats.completed}</div><div className="stat-sub">Fulfilled today</div></div>
          </div>
          <div className="card">
            <h2 className="card-title">Today&apos;s Orders</h2>
            <div className="flex-col gap-0">
              {orders.slice(0, 8).map((order) => (
                <div key={order.id} className="flex justify-between items-center py-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
                  <div>
                    <div className="font-bold">Table {order.tableNumber || "-"}</div>
                    <div className="text-sm text-muted">{order.items.length} item(s) · <span className={getStatusBadge(order.status)}>{order.status}</span></div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div className="font-bold">₱{order.totalAmount.toLocaleString()}</div>
                    <div className="text-sm text-muted">{formatTimeAgo(order.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
