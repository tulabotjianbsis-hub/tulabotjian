"use client";

import { useState, useTransition } from "react";
import { getSalesReport, getTopSellingItems } from "@/lib/actions/analytics";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from "recharts";

type Period = "day" | "week" | "month" | "year";

type SalesReport = {
  totalRevenue: number; totalExpenses: number; netProfit: number; totalOrders: number;
  salesByDay: Array<{ date: string; total: number; expenses: number; orders: number }>;
};

type TopItem = { menuItemId: string; name: string; quantity: number; revenue: number };

export default function ReportsClient({
  initialSales,
  initialTopItems,
}: {
  initialSales: SalesReport;
  initialTopItems: TopItem[];
}) {
  const [period, setPeriod] = useState<Period>("week");
  const [sales, setSales] = useState(initialSales);
  const [topItems, setTopItems] = useState(initialTopItems);
  const [isPending, startTransition] = useTransition();

  function handlePeriodChange(p: Period) {
    setPeriod(p);
    startTransition(async () => {
      const [newSales, newTop] = await Promise.all([getSalesReport(p), getTopSellingItems(p)]);
      setSales(newSales);
      setTopItems(newTop);
    });
  }

  const profitTrend = sales.salesByDay.map((d) => ({
    date: d.date,
    profit: d.total - d.expenses,
  }));

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title" style={{ margin: 0 }}>Reports</h1>
        <div className="page-actions">
          <button className="btn btn-secondary">🖨️ Print</button>
          <button className="btn btn-secondary">📥 Download CSV</button>
        </div>
      </div>

      <div className="tab-list boxed mb-6">
        {(["day", "week", "month", "year"] as Period[]).map((p) => (
          <button
            key={p}
            className={`tab-btn ${period === p ? "active" : ""}`}
            onClick={() => handlePeriodChange(p)}
            disabled={isPending}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
        {isPending && <span style={{ fontSize: 12, color: "var(--text-muted)", alignSelf: "center" }}>Loading...</span>}
      </div>

      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-label">Total Revenue</div>
          <div className="stat-value">₱{sales.totalRevenue.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Expenses</div>
          <div className="stat-value">₱{sales.totalExpenses.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Net Profit</div>
          <div className="stat-value">₱{sales.netProfit.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{sales.totalOrders}</div>
        </div>
      </div>

      <div className="grid-2 mb-6">
        <div className="card">
          <h2 className="card-title">Revenue vs Expenses</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={sales.salesByDay} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => `₱${Number(v).toLocaleString()}`} />
                <Legend />
                <Bar dataKey="total" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h2 className="card-title">Profit Trend</h2>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer>
              <LineChart data={profitTrend} margin={{ top: 20, right: 20, left: 0, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => `₱${Number(v).toLocaleString()}`} />
                <Line type="monotone" dataKey="profit" name="Net Profit" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Top Menu Items</h2>
        {topItems.length === 0 ? (
          <div className="text-center py-8 text-muted">No completed orders in this period.</div>
        ) : (
          <div className="flex-col gap-0">
            {topItems.map((item, i) => (
              <div key={item.menuItemId} className="flex justify-between items-center py-4"
                style={{ borderBottom: i < topItems.length - 1 ? "1px solid var(--card-border)" : "none" }}>
                <div style={{ fontWeight: 500 }}>{item.name}</div>
                <div style={{ textAlign: "right" }}>
                  <div className="font-bold">₱{item.revenue.toLocaleString()}</div>
                  <div className="text-sm text-muted">{item.quantity} sold</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
