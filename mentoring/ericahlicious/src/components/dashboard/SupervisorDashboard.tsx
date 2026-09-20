"use client";

import { MockOrder, MockOrderItem } from "@/lib/mock-data";

type DashboardProps = {
  orders: MockOrder[];
  dailyStats: {
    total: number;
    completed: number;
    pending: number;
    preparing: number;
    ready: number;
    cancelled: number;
    totalAmount: number;
  };
};

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

export function SupervisorDashboard(props: DashboardProps) {
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>All Orders</h1>
      </div>

      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₱{props.dailyStats.totalAmount.toLocaleString()}</div>
          <div className="stat-sub">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{props.dailyStats.total}</div>
          <div className="stat-sub">All orders today</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending / Preparing</div>
          <div className="stat-value">{props.dailyStats.pending + props.dailyStats.preparing}</div>
          <div className="stat-sub">Active orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{props.dailyStats.completed}</div>
          <div className="stat-sub">Fulfilled today</div>
        </div>
      </div>

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
            {props.orders.map((order) => {
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
    </div>
  );
}
