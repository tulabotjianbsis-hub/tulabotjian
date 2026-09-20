"use client";

import { useState } from "react";
import { MOCK_ORDERS, MOCK_DAILY_ORDER_STATS } from "@/lib/mock-data";

function getStatusBadge(status: string) {
  switch (status.toUpperCase()) {
    case "COMPLETED": return "badge badge-completed";
    case "PENDING": return "badge badge-pending";
    case "PREPARING": return "badge badge-preparing";
    case "READY": return "badge badge-ready";
    case "CANCELLED": return "badge badge-cancelled";
    default: return "badge badge-completed";
  }
}

function formatTimeAgo(date: Date) {
  const mins = Math.floor((Date.now() - date.getTime()) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ago`;
}

export default function OrdersPage() {
  const [activeTab, setActiveTab] = useState<"ALL" | "DAILY">("ALL");

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Orders</h1>
        <div className="tab-list boxed">
          <button
            className={`tab-btn ${activeTab === "ALL" ? "active" : ""}`}
            onClick={() => setActiveTab("ALL")}
          >
            All Orders
          </button>
          <button
            className={`tab-btn ${activeTab === "DAILY" ? "active" : ""}`}
            onClick={() => setActiveTab("DAILY")}
          >
            Daily Sales
          </button>
        </div>
      </div>

      {activeTab === "ALL" && (
        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Table</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ORDERS.map((order) => {
                const itemsText = order.items.map((i) => `${i.menuItem.name} x${i.quantity}`).join(", ");
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 600, color: "var(--text-secondary)" }}>Ord - {order.orderNumber}</td>
                    <td>Table {order.tableNumber || "-"}</td>
                    <td className="truncate" style={{ maxWidth: 300 }} title={itemsText}>{itemsText}</td>
                    <td style={{ fontWeight: 600 }}>₱{order.totalAmount}</td>
                    <td>
                      <span className={getStatusBadge(order.status)}>{
                        order.status.charAt(0).toUpperCase() + order.status.slice(1).toLowerCase()
                      }</span>
                    </td>
                    <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{formatTimeAgo(order.createdAt)}</td>
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
            <div className="stat-card">
              <div className="stat-label">Total Revenue</div>
              <div className="stat-value">₱{MOCK_DAILY_ORDER_STATS.totalAmount.toLocaleString()}</div>
              <div className="stat-sub">Today</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Total Orders</div>
              <div className="stat-value">{MOCK_DAILY_ORDER_STATS.total}</div>
              <div className="stat-sub">All orders today</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Paid Orders</div>
              <div className="stat-value">{MOCK_DAILY_ORDER_STATS.completed}</div>
              <div className="stat-sub">Completed payments</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Avg Order Value</div>
              <div className="stat-value">₱{Math.round(MOCK_DAILY_ORDER_STATS.totalAmount / MOCK_DAILY_ORDER_STATS.total).toLocaleString()}</div>
              <div className="stat-sub">Per paid order</div>
            </div>
          </div>

          <div className="card">
            <h2 className="card-title">Recent Orders</h2>
            <div className="flex-col gap-0">
              {MOCK_ORDERS.slice(0, 4).map((order) => {
                const isPaid = order.status === "COMPLETED";
                return (
                  <div key={order.id} className="flex justify-between items-center py-3" style={{ borderBottom: "1px solid var(--card-border)" }}>
                    <div>
                      <div className="font-bold">Table {order.tableNumber || "-"}</div>
                      <div className="text-sm text-muted">{order.items.length} Items {order.status}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div className="font-bold">₱{order.totalAmount}</div>
                      <div className="text-sm" style={{ color: isPaid ? "var(--status-good)" : "var(--text-muted)" }}>
                        {isPaid ? "paid" : "pending"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
